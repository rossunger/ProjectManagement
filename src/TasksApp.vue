<template>        
<div style="position:fixed; top:2px; left:2px; z-index:100; background-color: #44A; padding:7px; border-radius:20px; color:white" @click.self="menu=!menu" v-if="!menu">||||  </div>        
<div>        
    <button class="rootNav" v-for="root in viewRootPath" :key="root" @click="allowTransition=false; $store.state.viewRoot=root">{{$store.getters.taskById(root).name || '🏠'}}</button>
    <span style="color:white">&nbsp;{{$store.getters.viewRoot.name || '🏠'}}</span>    
</div>
<div @click.self="menu=!menu" v-show="menu" class="menu">                
    <h1>Filters</h1><br>
    Show me the tasks that are:<br><br>
    <div style="display:flex; flex-wrap: wrap; justify-content: center; text-align:center">
        <div style="width: 20%">                 
        <select ref="done" multiple @input="$store.state.viewFilters.done=Array.from($event.target.selectedOptions, option => option.value);">        
            <option selected disabled hidden style='display: none' value=''></option>
            <option v-for="done in [false, true]" :key="done" :value="done">{{done ? "done" : "to do" }}</option>
        </select> 
        <button class="clear" @click="clearSelect('done')">clear</button>
        </div>
        <div style="width: 20%; min-width:fit-content">
        <select ref="type" multiple @change="$store.state.viewFilters.type=Array.from($event.target.selectedOptions, option => option.value);">
            <option selected disabled hidden style='display: none' value=''></option>
            <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
        </select>
        <button class="clear" @click="clearSelect('type')">clear</button>
        </div>
        <div style="width: 20%">                                   
        <select ref="leader" multiple @change="$store.state.viewFilters.leader=Array.from($event.target.selectedOptions, option => $store.getters.personByName(option.value));">
            <option selected disabled hidden style='display: none' value=''></option>
            <option v-for="person in $store.state.people" :key="person" :value="person.name">{{person.name}}</option>
        </select>
        <button class="clear" @click="clearSelect('leader')">clear</button>
        </div>
        
    </div>
    <br><br>                    
    <h1>Views</h1><br>
    <button style="width: min(30%, 140px); " @click="$store.state.viewMode='tree'">List</button>
    <button style="width: min(30%, 140px);" @click="$store.state.viewMode='calendar'">Calendar</button>                    
    <button style="width: min(30%, 140px);" @click="$store.state.viewMode='paste'">Paste Tasks</button>                    
    <button style="width: min(30%, 140px);" @click="$store.state.viewMode='people'">Manage People</button>                    
    <br><br>
    <h1>Setting</h1>
    <button v-if="$store.state.authenticated" @click="$store.dispatch('logout')">LOGOUT</button>    
</div>     
<div class="reorderingTasks" v-if="reorderingTasks" @click="reorderingTasks=0"></div>           
<!-- div class="reparentTask" v-if="reparentTask!=0" @click="reparentTask=0">
    <input placeholder="search..." @click.stop style="border: white 1px solid; color:white" @input="doSearchParents($event.target.value)">
    <nested-task-tree-task :reparentingId="reparentTask" @reparent-task="doReparentTask" style="margin-left:40px;" v-for="child in tasks" :key="child" :task="child" />

</div-->
<div v-if="$store.state.viewMode=='tree'"
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
<button v-if="$store.state.viewRoot != -1" @click="allowTransition=false; $store.state.viewRoot = $store.getters.viewRoot.parent.id || -1" style="position:fixed; bottom:2px; right:2px; z-index:100">up</button>    
</template>

<script>
import arson from 'arson'
import calendar from "./Calendar"
import PostService from "./PostService";
import dateButton from "./dateButton"
import {DateTime} from "./RossUtils"
import task from "./task"
import nestedTaskTreeTask from './nestedTaskTreeTask'
import pasteTasks from './pasteTasks.vue'
import managePeople from './managePeople.vue'
export default {    
    name: "app",
    data(){
        return{
            menu: false, allowTransition: false, reorderingTasks:0, collapseAll: 0,
            reparentTask: 0, searchParents:"",
        }
    },
    components:{
        calendar,task, nestedTaskTreeTask, pasteTasks, managePeople
    },
    computed: { 
        loading: function(){
            return this.$store.state.loading
        },        
        tasks: function(){
            return this.$store.state.tasks
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
                return fail ? false : true                                   
            })
            return ret            
        },
        viewRootPath: function(){                        
            let id = this.$store.state.viewRoot;
            let ret = []                                               
            while (id != -1){                
                //debugger
                let t = this.$store.getters.taskById(id)                                                                
                //debugger
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
        
        let setUpdating = function(updating){this.$store.state.updating = updating}.bind(this)                
        let doLoadState = function(data){this.dispatch('loadChart', data)}.bind(this.$store)

        this.$socket.on('PMupdating', data=>setUpdating(data))        
        this.$socket.on('users', (msg)=>console.log(msg))        
        this.$socket.on('PMupdatedState', (data)=>doLoadState(data))
        this.$socket.emit('PMloadData') 
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
            this.reparentingTask=0
            this.reorderingTasks=0
        },
        clearSelect(name){            
            this.$refs[name].selectedIndex=0                    
            this.$store.state.viewFilters[name] = []
        }
    },    
    watch:{        
        tasks:{
            deep:true,
            handler(){                
                if(!this.$store.state.loading){
                    let data = arson.stringify({tasks: this.tasks, lastId: this.$store.state.lastId, people:this.$store.state.people, committees: this.$store.state.committees})            
                    this.$socket.emit('PMupdateState', data)                                
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
    top:0px; left:0px;
    background-color:#333D; 
    color:white; 
    z-index:20; 
    padding:20px;
    text-align:center;
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
    width:100%;
    background-color:slateblue;
    color:white
}
</style>