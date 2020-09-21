<template>    
    <div id="app" @scroll.prevent=""> 
        <!--div style="width: 100vw; height:100vh; background-color:black" v-if="$store.state.updating">UPDATING</div-->
        <!--button @click="sendSocket('test')">SEND SOCKET</button-->       
        <div>
            <span style="color:white" @click.self="menu=!menu" v-if="!menu">||||  </span>        
            <button class="rootNav" v-for="root in viewRootPath" :key="root" @click="allowTransition=false; $store.state.viewRoot=root">{{$store.getters.taskById(root).name || '🏠'}}</button>
            <span style="color:white">&nbsp;{{$store.getters.viewRoot.name || '🏠'}}</span>
        </div>
        <div @click.self="menu=!menu" v-if="menu" class="menu">
                <h1>Filters</h1>
                <select multiple @input="$store.state.viewFilters.done=Array.from($event.target.selectedOptions, option => option.value == 'to do' ? false : option.value == 'done' ? true : '');">
                    <option v-for="done in ['to do', 'done']" :key="done" :value="done">{{done}}</option>
                </select> 
                <input type="checkbox" value="done">                
                Task Types:
                <select multiple @change="$store.state.viewFilters.type=Array.from($event.target.selectedOptions, option => option.value);">
                    <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
                </select> 
                <br>
                Leaders:                       
                <select multiple @change="$store.state.viewFilters.leader=Array.from($event.target.selectedOptions, option => option.value);">
                    <option v-for="people in $store.state.people" :key="people" :value="people">{{people}}</option>
                </select>
                <br>
                <button  @click="$store.state.viewMode='cards'">Cards</button>
                <button  @click="$store.state.viewMode='tree'">Tree</button>
                <button  @click="$store.state.viewMode='calendar'">Calendar</button>
                <button  @click="$store.state.viewRoot=-1">ResetViewRoot</button>
                <!--button  @click="$store.state.tasks = []">Clear All Tasksk</button-->                                      
        </div>     
        <div class="reorderingTasks" v-if="reorderingTasks" @click="reorderingTasks=0">            
        </div>   
        <!-- TREE VIEW -->
        <div v-if="$store.state.viewMode=='tree'"
            class="background" 
            @dblclick.self="$store.dispatch('createTask', {name:'newTask', parent: $store.getters.viewRoot})">            
            <!--
            <transition-group :name="allowTransition && 'slide-fade' || ''" v-on:after-leave="allowTransition=false">
            -->
            <task :taskId="task.id" 
                v-for="task in tasksTree" :key="task" 
                :class="{task: true, done: task.done}"                 
                :style="{position:'relative', backgroundColor: task.color}"
                @stop-transitions="allowTransition=false;"
                @start-reorder-task="(id)=>reorderingTasks=id"
                @do-reorder-task="doReorderTask"
                :reorderingTasks="reorderingTasks"
                @collapse-all="(t)=>{if(collapseAll%2==t)collapseAll+=2; else collapseAll++;}"
                :collapseAll="collapseAll"
            /> 
            <!--                                                    
             </transition-group>
             -->
        </div>        
        <!-- CALENDAR VIEW -->
        <calendar v-if="$store.state.viewMode=='calendar'" class="background" />        
        <button v-if="$store.state.viewRoot != -1" @click="allowTransition=false; $store.state.viewRoot = $store.getters.viewRoot.parent.id || -1" style="position:fixed; bottom:2px; right:2px; z-index:100">up</button>
    </div>
</template>

<script>
import arson from 'arson'
import calendar from "./Calendar"
import PostService from "./PostService";
import dateButton from "./dateButton"
import {DateTime} from "./RossUtils"
import task from "./task"

export default {    
    name: "app",
    data(){
        return{
            menu: false, allowTransition: false, reorderingTasks:0, collapseAll: 0
        }
    },
    components:{
        calendar,task
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
    },    
    watch:{        
        tasks:{
            deep:true,
            handler(){                
                if(!this.$store.state.loading){
                    let data = arson.stringify({tasks: this.$store.state.tasks, lastId: this.$store.state.lastId})            
                    this.$socket.emit('PMupdateState', data)                                
                    console.log('tasks updated!')                                        
                }else 
                    this.$store.state.loading = false
            }
        },
        loading: function(loading){
            if(loading)
                this.allowTransition = false                                        
        }
    }
}

</script>
<style lang="scss">
@use "./CSS/main.scss" as *;
@use "vue-select/src/scss/vue-select.scss" as *;
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
    padding:20px
} 
.menu select{
    position:absolute;    
    height:18px;
    color:white
}
.menu select:hover{
    z-index:25;
    height:fit-content;
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
    background-color: #0007
}
</style>