import {createStore} from "vuex";
import _, { isArray, isString } from "lodash";
import {searchJSONForItem, searchJSONForParent, searchJSONandDelete, autoSave} from "./RossUtils.js"
import {TaskTemplate} from "./consts.js"
import dayjs from 'dayjs'
import arson from 'arson'
import PostService from "./PostService.js";

function setState(state, newState){
    Object.keys(newState).forEach(k=>{
        state[k] = newState[k]
    })            
}

export default createStore({    
    state:{  
        updating: false,
        loading:false,
        view: "All",
        viewMode: 'calendar',
        viewFilters:{
            filters: ['leader','type', 'done', 'current', 'parent', 'tags'],            
            leader: [],
            type: [],
            done: [],
            current: [],
            parent: [],
            tags: [],
        },
        viewRoot: -1,
        lastId: 0,       
        tasks:[
            
        ],        
        taskTypes: ['Make a list', 'Draft some text', 'Go Somewhere',
        'Pick dates/times', 'Watch/Read/Listen/Practice/Study', 'Contact someone',
        'Edit audio/video/image', 'Provide feedback', 'Brainstorm', 'Make/Move thing(s)', 
        'Google/Research', 'Crunch some numbers'],
        people: ['Jared', 'Ross'],
        undos: [],
        redos: [],
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
        }
    },
    mutations:{         
        reparentTask(task, newParent, newPosition){
            //newParent.tasks.splice(newPosition, 0, task)
            //task.parent.tasks = task.parent.tasks.filter(c=>{return c!=task})            
        },
        setView(state, view){
            state.view = view
        }
    },
    actions:{
        /*undo({state}){
            debugger
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
        async loadChart({state}, data){            
            state.loading = true
            data ? data = arson.parse(data) : data = arson.parse(await PostService.getChart('current'))        
            state.tasks = data.tasks
            state.lastId = data.lastId
        },
        createTask({dispatch, state}, {name, parent=state, due}){          
            let i = parent.tasks.push(_.cloneDeep(TaskTemplate)) - 1                        
            parent.tasks[i].name = name || "newTask"
            state.lastId += 1
            parent.tasks[i].id= state.lastId
            parent.tasks[i].parent=parent     
            if (due) parent.tasks[i].due=due

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
    }
})