<template>        
<div style="position:fixed; top:2px; left:2px; z-index:100; background-color: #44A; padding:7px; border-radius:20px; color:white" @click.self="menu=!menu" v-if="!menu">||||  </div>        
<div style="padding-left:50px; padding-top: 5px;">        
    <button class="rootNav" v-for="root in viewRootPath" :key="root" @click="allowTransition=false; $store.state.viewRoot=root">{{$store.getters.taskById(root).name || '🏠'}}</button>
    <span style="color:white">&nbsp;{{$store.getters.viewRoot.name || '🏠'}}</span>    
    
</div>
<div @click.self="menu=!menu" v-if="menu" class="menu">                
    <h1>Views</h1><br>
    <div style="display:inline-block; margin:2px;">
        <button class="menuTabs" @click="navigateTo('overview')">Overview</button>
        <button class="menuTabs" @click="navigateTo('tasks')">Tasks</button>
        <button class="menuTabs" @click="navigateTo('calendar')">Calendar</button>
        <button class="menuTabs" @click="navigateTo('events')">Plan Events</button>
        <button class="menuTabs" @click="navigateTo('gantt')">Gantt Chart</button>
        <button class="menuTabs" @click="navigateTo('people')">Manage People</button>                
        <button class="menuTabs" @click="navigateTo('paste')">Paste Action Items</button>
        <button class="menuTabs" @click="copyTasksToClipboard" v-if="$store.state.debug=='debug' ||this.$store.state.currentUser=='ross93@gmail.com' ">Copy Tasks To Clipboard</button>
        <button class="menuTabs" @click="navigateTo('tags')" v-if="$store.state.debug=='debug' ||this.$store.state.currentUser=='ross93@gmail.com' ">Edit Tags</button>
        <button class="menuTabs" @click="loadData('production')" v-if="$store.state.debug=='debug'">LOAD DATA FROM PRODUCTION</button>
        <button class="menuTabs" @click="pushDataToProduction" v-if="$store.state.debug=='debug'">PUSH DATA TO PRODUCTION</button>
        </div>
    <br><br>
    <h1>Group By</h1>
    <button class="menuTabs" @click="$store.state.groupBy=''">(none)</button>
    <button class="menuTabs" @click="$store.state.groupBy='person'">Person/Committee</button>
    <button class="menuTabs" @click="$store.state.groupBy='tag'">tag</button>    
    <h1>Filters</h1> <button class="menuTabs" @click="$store.dispatch('clearFilters')" v-if="filtering">Clear ALL</button> <br><br>
    Show me the tasks that contain:<br>
    <input placeholder="search..." @click.stop style="border: white 1px solid; color:white" 
    @input="$store.state.viewFilters.search = $event.target.value" :value="$store.state.viewFilters.search"> <button v-if="$store.state.viewFilters.search!= ''" @click="$store.state.viewFilters.search=''" style="border-radius:5px; background-color: slateblue; color: white">x</button>
    <br>and are:
    <br><br>
    
    <div @click.self="menu=!menu" style="text-align:center; width: max-content; display: inline-block;">
        <div @click.self="menu=!menu" class="filterSelectParent">                 
            <select-box class="filterSelect" :array="['to do','done']" :showOne="false" 
                :selected="$store.state.viewFilters.done.map(d=> d ? 'done' : 'to do')" 
                @changed-multi="(done)=>$store.state.viewFilters.done = done.map(d=> d=='done' ? true : false )" />        
            <button class="clear" @click="$store.state.viewFilters.done = [true, false]">All</button>
            <button class="clear" @click="$store.state.viewFilters.done = []">Clear</button>
        </div>           <br>
        <div @click.self="menu=!menu" class="filterSelectParent">
            <select-box class="filterSelect" :array="$store.state.taskTypes" 
                :showOne="false" :selected="$store.state.viewFilters.type" 
                @changed-multi="(types)=>this.$store.state.viewFilters.type = types" />                   
            <button class="clear" @click="$store.state.viewFilters.type=[...$store.state.taskTypes]">All</button>
            <button class="clear" @click="$store.state.viewFilters.type=[]">clear</button>
        </div><br>
        <div @click.self="menu=!menu" class="filterSelectParent">                                           
        <select-box class="filterSelect" :array="$store.state.people" 
            :showOne="false" :selected="$store.state.viewFilters.leader" 
            @changed-multi="(leaders)=>$store.state.viewFilters.leader = leaders" />           
        <button class="clear" @click="$store.state.viewFilters.leader=[...$store.state.people]">All</button>
        <button class="clear" @click="$store.state.viewFilters.leader=[]">clear</button>
        </div><br>
        <div @click.self="menu=!menu" class="filterSelectParent">                                           
        <select-box class="filterSelect" :array="$store.state.committees" 
            :showOne="false" :selected="$store.state.viewFilters.leader" 
            @changed-multi="(leaders)=>$store.state.viewFilters.leader = leaders" />           
        <button class="clear" @click="$store.state.viewFilters.leader=[...$store.state.committees]">All</button>
        <button class="clear" @click="$store.state.viewFilters.leader=[]">clear</button>
        </div><br>

        <div @click.self="menu=!menu" class="filterSelectParent">                 
            <select-box class="filterSelect" :array="Array.from($store.state.tags)" :showOne="false" 
                :selected="$store.state.viewFilters.tags" 
                @changed-multi="(tags)=>{$store.state.viewFilters.tags = tags}" />        
            <button class="clear" @click="$store.state.viewFilters.tags = Array.from($store.state.tags)">All</button>
            <button class="clear" @click="$store.state.viewFilters.tags = []">Clear</button>
        </div>        
        
    </div>
    <br><br>                    
    
    <h1>Setting</h1>
    <button class="menuTabs" v-if="$store.state.authenticated" @click="$store.dispatch('logout')">LOGOUT</button>    
</div>     
<div class="reorderingTasks" v-if="reorderingTasks" @click="reorderingTasks=0"></div>           
<div class="reparentTask" v-if="reparentTask!=0" @click="reparentTask=0">
    <input placeholder="search..." @click.stop style="border: white 1px solid; color:white" @input="doSearchParents($event.target.value)">
    <nested-task-tree-task :reparentingId="reparentTask" @reparent-task="doReparentTask" style="margin-left:40px;" v-for="child in tasks" :key="child" :task="child" />

</div>
<div v-if="$store.state.viewMode=='tasks' && $store.state.groupBy==''" @contextmenu.self.prevent="menu=!menu"
    style="width:100%; height:100%; min-height:100vh" 
    @dblclick.self="$store.dispatch('createTask', {name:'newTask', parent: $store.getters.viewRoot})">                    
    <transition-group :name="allowTransition && 'slide-fade' || ''" v-on:after-leave="allowTransition=false">    
    <task :taskId="task.id" 
        v-for="task in tasksTree" :key="task"     
        :style="{position:'relative', backgroundColor: task.color, 'margin':'auto!important'}"
        @stop-transitions="allowTransition=false;"
        @start-reorder-task="(id)=>{reorderingTasks=id}"
        @do-reorder-task="doReorderTask"
        @reparent-task="(id)=>reparentTask=id"
        :reorderingTasks="reorderingTasks"
        @collapse-all="(t)=>{if(collapseAll%2==t)collapseAll+=2; else collapseAll++;}"
        :collapseAll="collapseAll"        
    />    
        </transition-group>                    
</div>    
<div v-if="$store.state.viewMode=='tasks' && $store.state.groupBy=='person'"> 
    <div v-for="person in [...$store.state.people, ...$store.state.committees]" :key="person">
        <h1 @click="collapsedPeople.has(person) ? collapsedPeople.delete(person) : collapsedPeople.add(person)" style="text-align:center; color:white; background-color: #3333">{{collapsedPeople.has(person) ? "+ " : "- "}}{{person.name}}</h1><br>        
        <div v-if="!collapsedPeople.has(person)">
        <task :taskId="task.id" 
        v-for="task in $store.getters.filterTasks(undefined, $store.getters.tasksByPerson(person))" :key="task"     
        :style="{position:'relative', backgroundColor: task.color, 'margin':'auto!important'}"
        @stop-transitions="allowTransition=false;"
        @start-reorder-task="(id)=>{reorderingTasks=id}"
        @do-reorder-task="doReorderTask"
        @reparent-task="(id)=>reparentTask=id"
        :reorderingTasks="reorderingTasks"
        @collapse-all="(t)=>{if(collapseAll%2==t)collapseAll+=2; else collapseAll++;}"
        :collapseAll="collapseAll"        />            
        </div>
    </div>
</div>
<div v-if="$store.state.viewMode=='tasks' && $store.state.groupBy=='tag'"> 
    <div v-for="tag in $store.state.tags" :key="tag">
        <h1 @click="collapsedTags.has(tag) ? collapsedTags.delete(tag) : collapsedTags.add(tag)" style="text-align:center; color:white; background-color: #3333">{{collapsedTags.has(tag) ? "+ " : "- "}}{{tag}}</h1><br>        
        <div v-if="!collapsedTags.has(tag)">
        <task :taskId="task.id" 
        v-for="task in $store.getters.filterTasks(undefined, $store.getters.tasksByTag(tag))" :key="task"     
        :style="{position:'relative', backgroundColor: task.color, 'margin':'auto!important'}"
        @stop-transitions="allowTransition=false;"
        @start-reorder-task="(id)=>{reorderingTasks=id}"
        @do-reorder-task="doReorderTask"
        @reparent-task="(id)=>reparentTask=id"
        :reorderingTasks="reorderingTasks"
        @collapse-all="(t)=>{if(collapseAll%2==t)collapseAll+=2; else collapseAll++;}"
        :collapseAll="collapseAll"        />            
        </div>
    </div>
</div>
<div v-if="$store.state.viewMode=='tags'">    
    <button class="button" @click="addTag">+</button>
    <div v-for="tag in $store.state.tags" :key="tag">
        <input :value="tag" @change="$store.state.tags.delete(tag); $store.state.tags.add($event.target.value)"> <button @click="$store.state.tags.delete(tag);">x</button>
    </div>
</div>
<calendar v-if="$store.state.viewMode=='calendar'" style="position: absolute; top:0px; left:0px"/>        
<paste-tasks v-if="$store.state.viewMode=='paste'" style="position: absolute; top:0px; left:0px"/>        
<manage-people v-if="$store.state.viewMode=='people'" style="position: absolute; top:0px; left:0px"/>        
<overview v-if="$store.state.viewMode=='overview'" />        
<gantt v-if="$store.state.viewMode=='gantt'" />        
<div v-if="$store.state.viewMode=='events'" @contextmenu.self.prevent="menu=!menu" style="position: absolute; top:0px; left:0px; height: 100vh; width:100vw">
    <h1 style="margin-top: 50px; margin-left:2vw; color:white;">PLANNING EVENTS</h1>
    <div @contextmenu.prevent class="eventsGrid" style="margin-left:2vw; overflow-x:scroll; display:grid; color:white" >
        
        <div v-for="(txt, i) in eventChecklist" :key="i" :style="{'grid-area': '1 / ' + (i+1), padding:'10px', border:'red 0px solid'}">
            {{txt}}
        </div>
        <div v-for="i in 10" :key="i" :style="{'grid-area': '3 / ' + i, border:'red 0px solid' }">
            <div v-for="(task, j) in eventTasks" :key="j" :style="{'grid-area': i +'/'+j, border:'orange 1px solid', height:'30px', 'line-height':'30px'}">
            <!-- j is the event, and i is the parameters -->
                <div v-if="i==1" style="padding-left:8px">
                    {{task.name}}
                </div>
                <date-button v-if="i==2" :task="task" />                
                <span v-if="i==2">{{task.due.toLocaleString('default', { month: 'short', day: 'numeric' })}}</span>
                <!--input type="date" :valueAsNumber="task.due" @change="task.due=new Date($event.target.value)" style="filter: invert(100%)" v-if="i==2"-->                                    
                <select-box v-if="i==3" :array="[{name:'location1'},{name: 'to do: make locations work'}]" :showOne="true" />
                <select-box v-if="i==4" :array="[{name:'car'},{name: 'walk'}]" :showOne="true" />                
                <!-- to do: add social media post tasks multi-select here -->
            </div>
        </div>
    </div>
</div>        
<button v-if="$store.state.viewRoot != -1" @click="allowTransition=false; $store.state.viewRoot = $store.getters.viewRoot.parent.id || -1" style="position:fixed; bottom:2px; right:2px; z-index:100">up</button>    
</template>

<script>
import arson from 'arson'
import router from '@/router'
import _ from 'lodash'
import calendar from "./Calendar"
import PostService from "./PostService";
import dateButton from "./dateButton"
import {DateTime} from "./RossUtils"
import task from "./task"
import nestedTaskTreeTask from './nestedTaskTreeTask'
import pasteTasks from './pasteTasks.vue'
import managePeople from './managePeople.vue'
import selectBox from "./selectBox"
import overview from "./overview"
import gantt from "./gantt"
import io from 'socket.io-client'
import {baseurl} from "./PostService"
const socket = io(baseurl, {query: { env: process.env.VUE_APP_ENV }}) 
function debounceSaves(save, dispatch, socket){    
    save.counter++
    save.timer = undefined
    dispatch('saveDataToDB', {socket})    
}
export default {    
    name: "app",
    data(){
        return{
            menu: false, allowTransition: false, reorderingTasks:0, collapseAll: 0,
            reparentTask: 0, searchParents:"", eventChecklist: ['Name', 'Date', 'Location', 'Transport', 'Social Media Posts', ],            
            save: {counter: 0, timer: undefined, delay:400}, initialisedChart:false, collapsedPeople: new Set(), collapsedTags: new Set(),
        }
    },
    components:{
        calendar,task, nestedTaskTreeTask, pasteTasks, managePeople, selectBox, overview, gantt,dateButton
    },
    computed: {                   
        events: function(){ return this.$store.state.events},
        projects: function(){ return this.$store.state.projects},
        committees: function(){  return this.$store.state.committees},
        people: function(){ return this.$store.state.people},        
        tags: function(){ return this.$store.state.tags},
        filtering: function(){            
            if (this.$store.state.viewFilters.leader.length > 0 ||
                this.$store.state.viewFilters.type.length > 0||            
                this.$store.state.viewFilters.done.length > 0 ||
                this.$store.state.viewFilters.due.length > 0 ||
                this.$store.state.viewFilters.current.length > 0 ||
                this.$store.state.viewFilters.parent.length > 0||
                this.$store.state.viewFilters.tags.length > 0 ||
                this.$store.state.viewFilters.search != ""
            )   return true
        },
        loading: function(){
            return this.$store.state.loading
        },        
        tasks: function(){
            return this.$store.state.tasks
        },
        eventTasks: function(){
            return this.tasks.filter(t=>Array.from(t.tags).includes('event'))
        },
        tasksTree: function(){                      
            if (this.$store.state.groupBy == "")
                return this.$store.getters.filterTasks()                                           
        },
        viewRootPath: function(){                        
            let id = this.$store.state.viewRoot;
            let ret = []                                               
            while (id != -1){                                
                let t = this.$store.getters.taskById(id)                                                                                
                if (t.parent.id){                    
                    id = t.parent.id 
                }
                else 
                    id = -1                
                ret = [id, ...ret]
            }                                 
            return ret
        }
    },    
    mounted(){ 
        if (!this.$store.state.currentUser)this.$store.state.currentUser = localStorage.getItem('current_user')
        document.addEventListener('keydown', this.keyDown)                
        let x= socket;        
        socket.emit('setRoom', this.$store.state.debug == 'debug' ? 'debug': 'production' )         
        let setUpdating = function(updating){this.$store.state.updating = updating}.bind(this)                
        let doLoadState = function(data){this.state.initialisedChart=true; this.dispatch('loadChart', data)}.bind(this.$store)                        
        socket.on('PMupdating', data=>setUpdating(data))        
        socket.on('users', (msg)=>console.log(msg))        
        socket.on('PMupdatedState', (data)=>doLoadState(data))
        socket.on('PMupdateSuccess', (success)=>{
            if(!success){
                alert('failed to save your changes. Please refresh the browser and try again')
            }
        })
        socket.on('changes committed', ()=>console.log('changes saved to DB'))                                
    },
    methods:{                             
        keyDown(ev){            
            if(ev.ctrlKey && ev.key=='z'){
                /*
                if (ev.shiftKey)
                    this.$store.dispatch('redo')
                else
                    this.$store.dispatch('undo')
                    */
            }
        },    
        doReorderTask(id){            
            this.allowTransition=true
            if (id != undefined)
                this.$store.dispatch('reorderTask', {taskId: this.reorderingTasks, positionId: id})
            this.reorderingTasks=0
        },
        doSearchParents(txt){
            this.searchParents = txt
        },
        doReparentTask(id){
            this.$store.dispatch('reparentTask', {task:this.reparentTask, newParent:id, newPosition:0})
            this.reparentTask=0
            this.reorderingTasks=0
        },
        clearSelect(name){            
            this.$refs[name].selectedIndex=0                    
            this.$store.state.viewFilters[name] = []
        },                
        async loadData(chart){
            let data = await PostService.getChart(chart)                        
            this.$store.dispatch('loadChart', data)
        },
        async pushDataToProduction(){
            if (confirm("Are you sure you want to overwrite the production data??")){
                let data = await this.$store.dispatch('stringify')
                socket.emit('PMupdateState', data, 'production')                   
            }             
        },
        navigateTo(page){
            this.$store.dispatch('doNavigate', page)
            this.menu=false;
        },
        addTag(){
            let tag = prompt('Name the tag')
            this.$store.state.tags.add(tag)
        },
        /*
        copyTasksToClipboard(){       
            let txt = ""
            function flattenTasks(t, prefix){
                let ret = prefix + t + '\n'
                if(t.tasks){
                    flatten
                }
                
                return ret
            }
            tasksTree.forEach(t=>{
                txt += flattenTasks(t,'=')
            })
            
            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = txt
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);            
        },
        */        
    },    
    watch:{        
        tasks:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, this.save.delay, this.save, this.$store.dispatch, socket); }}},        
        events:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, this.save.delay, this.save, this.$store.dispatch, socket); }}},        
        projects:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, this.save.delay, this.save, this.$store.dispatch, socket); }}},        
        //tasks:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, 500, this.save, this.$store.dispatch, socket); }}},        
        //tasks:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, 500, this.save, this.$store.dispatch, socket); }}},        
        //tasks:{ deep:true, handler(){ if (!this.save.timer){ this.save.timer = setTimeout(debounceSaves, 500, this.save, this.$store.dispatch, socket); }}},        
        
        //projects:{ deep:true, handler(){ this.$store.dispatch('saveDataToDB', {socket: socket}) },},        
        //people:{ deep:true, handler(){ this.$store.dispatch('saveDataToDB', {socket: socket}) },},        
        //committees:{ deep:true, handler(){ this.$store.dispatch('saveDataToDB', {socket: socket}) },},        
        //tags:{ deep:true, handler(){ this.$store.dispatch('saveDataToDB', {socket: socket}) },},        
        loading: function(loading){
            if(loading)
                this.allowTransition = false                                        
        },                
    }
}

</script>
<style lang="scss">
@use "./CSS/main.scss" as *;
//@use "vue-select/src/scss/vue-select.scss" as *;
.rootNav{
    background-color: #0004;
    font-size:18px;
    height: 100%;
    margin-right:2px;
    border:none;
    color:white;
}
.menu{
    width:100vw; 
    height:100vh; 
    position:fixed; 
    overflow-y: scroll;
    top:0px; left:0px;
    background-color:#333D; 
    color:white; 
    z-index:20; 
    padding:20px;
    padding-bottom: 100px;
    text-align:center;
} 
.menu::-webkit-scrollbar{
    display:none;
}
.menu select{
    //position:absolute;    
 //   height:18px;
    width:100%;
    height:fit-content;
    color:white;
    background: transparent;
}
.menu select::-webkit-scrollbar {
  display: none;
}
input{
    background-color: transparent;
}
//Slide Fade Transition
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s ease; //cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(100px);
  opacity: 0;
}
.slide-fade-move{
    transition: transform 0.5s;
}
.reorderingTasks{
    width:100vw;
    height:100vh;
    top:0px;
    left:0px;
    position:fixed;
    background-color: #0007;    
}
a{
    color:white;
}
.reparentTask{
    z-index:100; 
    min-width:100vw;
    min-height:100vh;
    background-color: #0009;
    position:absolute;
    top:0px;
    color:white;
    padding-top:50px;
}
.clear{
    width:50%;
    background-color:slateblue;
    color:white
}
.filterSelect{
    color:black; 
    text-align:left;
    label{
        color:black;
    }
    min-width: 100%;    
}
.filter{
    width: 20%; 
    min-width:fit-content; 
    display: inline-block; 
    vertical-align:top;
}
.eventsGrid::-webkit-scrollbar{
    display:none;
}
</style>