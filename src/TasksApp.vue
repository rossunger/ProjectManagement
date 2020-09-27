<template>        
<div style="position:fixed; top:2px; left:2px; z-index:100; background-color: #44A; padding:7px; border-radius:20px; color:white" @click.self="menu=!menu" v-if="!menu">||||  </div>        
<div style="padding-left:50px; padding-top: 5px;">        
    <button class="rootNav" v-for="root in viewRootPath" :key="root" @click="allowTransition=false; $store.state.viewRoot=root">{{$store.getters.taskById(root).name || '🏠'}}</button>
    <span style="color:white">&nbsp;{{$store.getters.viewRoot.name || '🏠'}}</span>    
</div>
<div @click.self="menu=!menu" v-if="menu" class="menu">                
    <h1>Views</h1><br>
    <div style="display:inline-block; margin:2px;">
        <button class="menuTabs" @click="$store.state.viewMode='tree'; menu=false">Tasks</button>
        <button class="menuTabs" @click="$store.state.viewMode='calendar'; menu=false">Calendar</button>
        <!--button class="menuTabs" @click="$store.state.viewMode='events'; menu=false">Plan Events</button-->
        <button class="menuTabs" @click="$store.state.viewMode='people'; menu=false">Manage People</button>        
        <button class="menuTabs" @click="$store.state.viewMode='paste'; menu=false">Paste Action Items</button>
        </div>
    <br><br>
    <h1>Filters</h1><br>
    Show me the tasks that contain:<br>
    <input placeholder="search..." @click.stop style="border: white 1px solid; color:white" 
    @input="$store.state.viewFilters.search = $event.target.value"> 
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
<div v-if="$store.state.viewMode=='tree'" @contextmenu.self.prevent="menu=!menu"
    style="width:100%; height:100%; min-height:100vh" 
    @dblclick.self="$store.dispatch('createTask', {name:'newTask', parent: $store.getters.viewRoot})">                    
    <transition-group :name="allowTransition && 'slide-fade' || ''" v-on:after-leave="allowTransition=false">    
    <task :taskId="task.id" 
        v-for="task in tasksTree" :key="task"     
        :style="{position:'relative', backgroundColor: task.color}"
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
<calendar v-if="$store.state.viewMode=='calendar'" style="position: absolute; top:0px; left:0px"/>        
<paste-tasks v-if="$store.state.viewMode=='paste'" style="position: absolute; top:0px; left:0px"/>        
<manage-people v-if="$store.state.viewMode=='people'" style="position: absolute; top:0px; left:0px"/>        
<div v-if="$store.state.viewMode=='events'" @contextmenu.self.prevent="menu=!menu" style="position: absolute; top:0px; left:0px; height: 100vh; width:100vw">
    <h1 style="margin-top: 50px; margin-left:50px; color:white;">PLANNING EVENTS</h1>
    <div @contextmenu.prevent class="eventsGrid" style="margin-left:50px; max-width: 100%; overflow-x:scroll; display:grid; color:white" >
        
        <div v-for="(txt, i) in eventChecklist" :key="i" :style="{'grid-area': '1 / ' + (i+1), padding:'10px', border:'red 1px solid'}">
            {{txt}}
        </div>
        <div v-for="i in 10" :key="i" :style="{'grid-area': '3 / ' + i, border:'red 1px solid' }">
            <div v-for="(task, j) in eventTasks" :key="j" :style="{'grid-area': i +'/'+j, border:'orange 1px solid'  }">
            <!-- j is the event, and i is the parameters -->
                <div v-if="i==1" >
                    {{task.name}}
                </div>
                <input type="date" style="filter: invert(100%)" v-if="i==2">                                    
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
export default {    
    name: "app",
    data(){
        return{
            menu: false, allowTransition: false, reorderingTasks:0, collapseAll: 0,
            reparentTask: 0, searchParents:"", eventChecklist: ['Name', 'Date', 'Location', 'Transport', 'Social Media Posts', ],            
        }
    },
    components:{
        calendar,task, nestedTaskTreeTask, pasteTasks, managePeople, selectBox
    },
    computed: { 
        loading: function(){
            return this.$store.state.loading
        },        
        tasks: function(){
            return this.$store.state.tasks
        },
        eventTasks: function(){
            return this.tasks.filter(t=>Array.from(t.tags).includes('_event'))
        },
        tasksTree: function(){           
            let filters = this.$store.state.viewFilters            
            let ret = this.$store.getters.viewRoot.tasks.filter(t=>{
                let fail = false;                
                Object.values(filters.filters).forEach(f=>{                    
                    if (filters[f].length>0 && !filters[f].includes(t[f])){                                                                                            
                        fail=true
                    }                
                })   
                //Search box searches for names and tags
                if (filters.search !=""){                                
                    fail = fail || !(t.name.toLowerCase().includes(filters.search.toLowerCase()) || Array.from(t.tags).join().toLowerCase().includes(filters.search.toLowerCase()) )
                }                
                //tag select box
                if (filters.tags.length>0){                                                 
                    fail = fail || _.intersection(Array.from(t.tags), filters.tags).length==0
                }                
                return fail ? false : true                                   
            })
            return ret            
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
        document.addEventListener('keydown', this.keyDown)                
        this.$socket.emit('setRoom', this.$store.state.debug ? 'debug': 'production' )         
        let setUpdating = function(updating){this.$store.state.updating = updating}.bind(this)                
        let doLoadState = function(data){this.dispatch('loadChart', data)}.bind(this.$store)                        
        this.$socket.on('PMupdating', data=>setUpdating(data))        
        this.$socket.on('users', (msg)=>console.log(msg))        
        this.$socket.on('PMupdatedState', (data)=>doLoadState(data))
        this.$socket.on('PMupdateSuccess', (success)=>{
            if(!success){
                alert('failed to save your changes. Please refresh the browser and try again')
            }
        })
        
    },
    methods:{                             
        keyDown(ev){            
            if(ev.ctrlKey && ev.key=='z'){
                if (ev.shiftKey)
                    this.$store.dispatch('redo')
                else
                    this.$store.dispatch('undo')
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
    },    
    watch:{        
        tasks:{
            deep:true,
            handler(){                 
                if(!this.$store.state.loading){
                    let data = arson.stringify({tasks: this.tasks, lastId: this.$store.state.lastId, people:this.$store.state.people, committees: this.$store.state.committees, tags: this.$store.state.tags})            
                    this.$socket.emit('PMupdateState', data, this.$store.state.debug ? 'debug' : 'production')                                
                    console.log('tasks updated!')                                        
                }else 
                    this.$store.state.loading = false
            }
        },
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
.menuTabs{
    width: min(30%, 140px); height:60px; margin:2px;
    border-radius:10px; background-color: slateblue; color:white;
}
.eventsGrid::-webkit-scrollbar{
    display:none;
}
</style>