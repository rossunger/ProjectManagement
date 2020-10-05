import {createStore} from "vuex";
import _, { isArray, isString } from "lodash";
import {searchJSONForItem, searchJSONForParent, searchJSONandDelete, autoSave} from "./RossUtils.js"
import {TaskTemplate, PersonTemplate, CommitteeTemplate, EventTemplate, ProjectTemplate, WaterfallTemplate} from "./consts.js"
import dayjs from 'dayjs'
import arson from 'arson'
import PostService from "./PostService.js";
import auth0 from "auth0-js"
import router from "./router"
import { stringify } from "querystring";

const AllowedUsers = ["ross93@gmail.com", "jaredempsey@gmail.com", "williams.garry@gmail.com","benpal14@gmail.com",
"jewelyshanks@gmail.com", "ivy_charles@hotmail.com", "nathandoras@gmail.com", "dclark@nscad.ca", "harley.hefford@gmail.com", "ivycharles123@gmail.com", "jacksonc3k@gmail.com", ]


function setState(state, newState){
    Object.keys(newState).forEach(k=>{
        state[k] = newState[k]
    })            
}
export default createStore({    
    state:{  
        authenticated:false,        
        auth0: new auth0.WebAuth({        
            domain: process.env.VUE_APP_AUTH0_CONFIG_DOMAIN,
            clientID: process.env.VUE_APP_AUTH0_CONFIG_CLIENTID,            
            redirectUri: window.location.origin + '/auth0callback', //window.location.href + 'auth0callback',  //'http://192.168.0.146:8080/auth0callback', //process.env.VUE_APP_DOMAINURL + '/auth0callback',
            responseType:process.env.VUE_APP_AUTH0_CONFIG_RESPONSETYPE,
            scope: process.env.VUE_APP_AUTH0_CONFIG_SCOPE,
            connection: 'google',
        }),
        updating: false,
        currentUser: undefined,
        initialisedChart:false,
        loading:false,
        view: "All",
        viewMode: 'overview',
        debug: process.env.VUE_APP_ENV,
        groupBy: "person",
        sortBy: ['due', 'estimatedDuration', 'type'],
        sortOptions:['due', 'estimatedDuration', 'type', 'excitement', 'priority', 'tags'],
        viewFilters:{
            filters: ['leader','type', 'done', 'current', 'parent'],  
            dueTypes:['Overdue', 'Due today', 'Due this week', 'No due date'],
            leader: [],
            type: [],
            done: [false],
            due: [],
            current: [],
            parent: [],
            tags: [],
            search: ""
        },
        tags: new Set(),
        viewRoot: -1,
        lastId: 0,       
        lastPeopleCommitteeId: 0,
        tasks:[
            
        ],        
        taskTypes: ['(none)', 'Brainstorm', 'Draft', 'Research', 'Contact', 'Review/Approve',
        'Go Somewhere', 'Choose',  'Edit/Refine/Finalize', 'Make/Move physical things', 
        'Calculate', 'List',], 
        people: [], 
        nonePerson: {name: '(unassigned)', committees: [], email: ''},
        committees:[],
        projects: [],
        events: [],        
        undos: [],
        redos: [],
        waterfalls: [],
    },
    getters:{  
        taskById: (state,getters) => (id) =>{
            if (id==-1) return state            
            return getters.allTasks.find(t=>t.id==id) || state
        },
        viewRoot: (state,getters) => {
            if (state.viewRoot ==-1) return state
            return getters.allTasks.find(t=>t.id==state.viewRoot) || state
        },
        tasksByDate: (state,getters) => {            
            let ret = getters.allTasks.filter(t=>{return t.due})            
            ret = ret.sort(function(a,b){                                
                if (!b.due)return false
                return new Date(b.due).getTime() - new Date(a.due).getTime();
              });              
            return ret
        },
        tasksByPerson: (state,getters) => (person)=>{
            return getters.allTasks.filter(t=>t.leader.name == person.name)
        },
        tasksByTag: (state,getters) => (tag)=>{
            return getters.allTasks.filter(t=>t.tags.has(tag))
        },     
        tasksSortedBy:(state, getters) => (tasks = getters.allTasks, sortBy) => {                        
            if (!sortBy) sortBy = state.sortBy
            return tasks.sort((a,b)=>{return a[sortBy[0]] - b[sortBy[0]]})
            /*
            let sort0 = []
            if (sortBy[0]){
                sort0 = tasks.sort((a,b)=>{
                    return a[sortBy[0]] - b[sortBy[0]]
                })
                if (sortBy[1]){
                    //Sort within each category
                    if (sortBy[2]){
                        //Sort within each category
                    }
                }
            }        
            return     */
        },
        getTasksOnDate: (state,getters) => (d)=>{                        
            return getters.tasksByDate.filter((t)=>{                                                
                  
                let y = new Date(t.due).getFullYear() == d.getFullYear()
                let m = new Date(t.due).getMonth() == d.getMonth()
                let dd = new Date(t.due).getDate() == d.getDate()                  
                return( y && m && dd )
            })                        
        },
        allTasks: (state) =>{            
            function getChildTasks(parent){
                let ret = []
                parent.tasks.forEach(t=>{                    
                    ret.push(t)
                    ret = [...ret, ...getChildTasks(t)]
                })
                return ret
            }
            return getChildTasks(state)
        },
        filterTasks: (state, getters) => (filters = state.viewFilters, tasks = getters.viewRoot.tasks) => {                                               
            let ret = tasks.filter(t=>{
                let fail = false;                                
                Object.values(filters.filters).forEach(f=>{                    
                    if (filters[f].length>0 && !filters[f].includes(t[f])){                                                                                            
                        fail=true
                    }                
                })   
                //Search box searches for names and tags
                if (filters.search && filters.search !=""){                                
                    fail = fail || !(t.name.toLowerCase().includes(filters.search.toLowerCase()) || Array.from(t.tags).join().toLowerCase().includes(filters.search.toLowerCase()) )
                }                                
                //tag select box
                if (filters.tags.length>0){                                                 
                    fail = fail || _.intersection(Array.from(t.tags), filters.tags).length==0 //filters.tags.length
                }                                
                return fail ? false : true                                   
            })
            return ret            
        },    
        tasksByTag:(state,getters) => (tag, tasks=getters.allTasks) => {
            return tasks.filter(t=>t.tags.has(tag))
        },
        personByName: (state) => (name) =>{
            return state.people.find(p=>p.name==name)
        },
        personByEmail: (state) => (email) =>{
            return state.people.find(p=>p.email==email)
        },
        committeeByName: (state) => (name) =>{            
            return state.committees.find(c=>c.name==name)
        }
    },
    mutations:{                 
        setView(state, view){
            state.view = view
        }
    },
    actions:{
        reparentTask({getters}, {task, newParent, newPosition}){                        
            task = getters.taskById(task)
            newParent = getters.taskById(newParent)
            newParent.tasks.splice(newPosition, 0, task)
            task.parent.tasks.splice(task.parent.tasks.indexOf(task), 1)
            task.parent = newParent
            //newParent.tasks.splice(newPosition, 0, task)
            //task.parent.tasks = task.parent.tasks.filter(c=>{return c!=task})            
        },
        /*undo({state}){            
            if (state.undos.length>0){                      
                state.redos.push(arson.stringify({tasks: state.tasks, lastId: state.lastId}))          
                state.tasks = arson.parse(state.undos.pop())
                //state.tasks = []
                //console.log(state.tasks.length)                
            }
            else
                console.log('nothing left to undo!')
        },
        redo(state){
            if (state.redos.length>0){
                state.undos.push(arson.stringify(state.tasks))                  
                state.tasks = arson.parse(state.redos.pop())                              
            }
            else
                console.log('nothing left to redo!')
        },*/
        addUndo({state, dispatch}){                      
            //state.undos.push(arson.stringify(state.tasks))            
        },                
        
        createTask({dispatch, state}, {name, parent=state, due, leader, excitement, priority,estimatedDuration, tags}){          
            let task = parent.tasks[parent.tasks.push(_.cloneDeep(TaskTemplate)) - 1]
            task.name = name || "newTask"            
            state.lastId += 1
            task.id= state.lastId            
            task.type = state.taskTypes[0]                        
            task.parent=parent     
            if (due) task.due=due                        
            if (leader) task.leader=leader; else task.leader = state.nonePerson
            if (excitement) task.excitement=excitement
            if (priority) task.priority=priority
            if (estimatedDuration) task.estimatedDuration=estimatedDuration
            if (tags) tags.forEach(t=>{task.tags.add(t)})
            dispatch('addUndo')
        },   
        setTaskValues({},{task, name, type}){
            if (type)task.type=type
            if (name)task.name=name

            dispatch('addUndo')
        },
        reorderTask({state,getters,dispatch}, {taskId, positionId}){            
            let t = getters.taskById(taskId)
            let ti = t.parent.tasks.indexOf(t)
            let i=0;
            let p;
            if (positionId != 0)
            {
                p = getters.taskById(positionId)
                i = p.parent.tasks.indexOf(p)
                if (i < ti) i++ 
            }
            let task = t.parent.tasks.splice(ti, 1)[0]            
            t.parent.tasks.splice(i, 0, task)            
            dispatch('addUndo')
        },
        deleteTask({dispatch}, task){            
            task.parent.tasks.splice(task.parent.tasks.indexOf(task),1)
            dispatch('addUndo')
        },
        deleteTaskById({dispatch, getters}, taskId){
            dispatch('deleteTask', getters.taskById(taskId))
        },               
        login({state}){                  
            localStorage.setItem('DC_redirectPage', router.currentRoute.value.path) 
            let k = state.auth0.authorize()            
        },
        auth0HandleAuthentication({state, dispatch, getters}){            
            state.auth0.parseHash((err, authResult) => {                
                if(authResult && authResult.accessToken && authResult.idToken){
                    if (!AllowedUsers.includes(authResult.idTokenPayload.email)){               
                        alert('Invalid user. Please try a different account')
                        dispatch('logout')
                        router.replace('/')
                        return
                    }
                    let expiresAt = JSON.stringify(
                        authResult.expiresIn *1000 + new Date().getTime()
                    )                    
                    localStorage.setItem("access_token", authResult.accessToken)
                    localStorage.setItem("id_token" ,authResult.idToken)
                    localStorage.setItem("expires_at", expiresAt)
                    localStorage.setItem("current_user", authResult.idTokenPayload.email)                                        
                    let page = localStorage.getItem('DC_redirectPage')                
                    localStorage.removeItem('DC_redirectPage')
                    //load data here!!
                    let data = PostService.getChart(state.debug=='debug' ? 'debug' : 'production')
                    dispatch('loadChart', data)
                    router.replace(page)                                        
                }
                else if (err){
                    alert('login failed')
                    router.replace('/')
                }
            })
        },
        logout(){
            console.log('logging out')            
            localStorage.removeItem("access_token")
            localStorage.removeItem("id_token")
            localStorage.removeItem("expires_at")
            localStorage.removeItem("current_user")
            window.location.href = process.env.VUE_APP_AUTH0_CONFIG_DOMAINURL + "/v2/logout?returnTo=" +process.env.VUE_APP_DOMAINURL+ "&client_id="+process.env.VUE_APP_AUTH0_CONFIG_CLIENTID                                    
        },
        addPerson({state}, name=""){
            let p =_.cloneDeep(PersonTemplate)
            state.lastPeopleCommitteeId++
            p.name= name || "New Person" + state.lastPeopleCommitteeId            
            state.people.push(p)               
        },
        renamePerson({state}, {person, newName}){
            if (state.people.find(p=>{return p.name==newName}))
            {
                alert('that person already exists!')
                return
            }
            person.name=newName
        },
        addCommitteeToPerson({state,getters}, {person, committeeName}){                        
            if(!person.committees.find(c=>c.name == committeeName)){
                person.committees.push(getters.committeeByName(committeeName))
            }
        },        
        unlinkCommitteeAndPerson({state,getters}, {person, committee}){
            committee.members.splice(committee.members.indexOf(person), 1)
            person.committees.splice(person.committees.indexOf(committee),1)
        },        
        setPersonsCommittees({state,getters}, {person, committeeNames}){            
            person.committees.forEach(c=>{                
                c.members.splice(c.members.indexOf(person), 1)
            })
            person.committees = []
            committeeNames.forEach(c=>{
                let committee = getters.committeeByName(c)
                person.committees.push(committee)                
                if(!committee.members.find(p=>p==person))
                    committee.members.push(person)
            })            
        },              
        setCommitteesPeople({state,getters, dispatch}, {committee, PeoplesNames}){            
            committee.members.forEach(p=>{                
                p.committees.splice(p.committees.indexOf(committee), 1)
            })
            committee.members = []
            PeoplesNames.forEach(p=>{
                let person = getters.personByName(p)
                committee.members.push(person)                
                if(!person.committees.find(c=>c==committee))
                    person.committees.push(committee)
            })            
        },
        clearCommitteesPeople({}, {committee}){            
            committee.members.forEach(p=>{                
                p.committees.splice(p.committees.indexOf(committee), 1)
            })
            committee.members = []                        
        },
        removePerson({state}, person){        
            person.committees.forEach(c=>{
                c.members.splice(c.members.indexOf(person), 1)
            })
            state.people.splice(state.people.indexOf(person),1)
            person = []
        },
        removeCommittee({state}, committee){
            committee.members.forEach(p=>{
                p.committees.splice(p.committees.indexOf(committee), 1)
            })
            state.committees.splice(state.committees.indexOf(committee),1)
            committee = []
        },
        addCommittee({state}, name=""){
            let c = _.cloneDeep(CommitteeTemplate)
            state.lastPeopleCommitteeId++
            c.name= name || "New Committee" + state.lastPeopleCommitteeId
            state.committees.push(c)
        },
        renameCommittee({state}, {committee, newName}){
            if (state.committees.find(c=>{return c.name==newName}))
            {
                alert('that person already exists!')
                return
            }
            committee.name=newName
        },
        addPersonToCommittee({state,getters}, {committee, personName}){            
            if(!committee.members.find(p=>p.name == personName)){
                committee.members.push(getters.personByName(personName))
            }
        },
        doNavigate({}, page){
            router.push(page);
        },     
        createEvent({state}, name='New Event'){
            let e = _.cloneDeep(EventTemplate)
            e.name = name || 'New Event'
            state.events.push(e)
        },
        createProject({state}, name='New Project'){
            let p = _.cloneDeep(ProjectTemplate)
            p.name = name            
            state.projects.push(p)
        },
        stringify({state}, ){
            return arson.stringify({
                tasks: state.tasks, 
                lastId: state.lastId, 
                people: state.people, 
                committees: state.committees, 
                tags: state.tags, 
                projects: state.projects, 
                events: state.events,
            })            
        },
        async saveDataToDB({state, dispatch}, {socket}){
            if(!state.initialisedChart)return
            if(!state.loading){                    
                let data = await dispatch('stringify', state)                
                socket.emit('PMupdateState', data, state.debug =="debug" ? 'debug' : 'production')                                
                console.log('tasks updated!')                                        
            }else 
                state.loading = false
        },
        async loadChart({state, getters, dispatch}, data){                        
            state.loading = true                        
            if (data)data = arson.parse(data);            
            else throw 'could not load data!' //: data = arson.parse(await PostService.getChart('current'))        
            state.tasks = data.tasks
            state.lastId = data.lastId
            state.committees = data.committees || state.committees
            state.people = data.people || state.people
            state.tags = data.tags || state.tags
            state.events = data.events || state.events
            state.projects = data.projects || state.projects                    
            if (state.debug=='debug') 
                state.currentUser = getters.personByName('Ross')
            if (state.currentUser && state.currentUser.theme.back){                
                document.documentElement.style.setProperty('--back', state.currentUser.theme.back)
            }            
            return true
        },
        clearFilters({state}){
            state.viewFilters.leader = []
            state.viewFilters.type = []
            state.viewFilters.done = []
            state.viewFilters.due = []
            state.viewFilters.current = []
            state.viewFilters.parent = []
            state.viewFilters.tags = []
            state.viewFilters.search = ""
        },
        createWaterfall({state}, {name = "New Waterfall"}){
            let w = _.cloneDeep(WaterfallTemplate)
            state.waterfalls.push(w)            
            w.name = name
        },
    }
})

