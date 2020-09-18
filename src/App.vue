<template>    
    <div id="app" @scroll.prevent="">        
        <div @click.self="menu=!menu" style="position:fixed; padding: 7px; color:white; z-index:20">||||                    
            <button v-if="menu" @click="setAllTasks">All Tasks</button>
            <button v-if="menu" @click="setCurrentTasks">Current Tasks</button>
            <button v-if="menu" @click="SetDoneTasks">Completed Tasks</button>        
            <select multiple v-if="menu" @change="task.type=$event.target.value">
                <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
            </select>                        
            <select multiple v-if="menu" @change="task.leader=$event.target.value">
                <option v-for="people in $store.state.people" :key="people" :value="people">{{people}}</option>
            </select>
            <button v-if="menu" @click="$store.state.viewMode='cards'">Cards</button>
            <button v-if="menu" @click="$store.state.viewMode='tree'">Tree</button>
            <button v-if="menu" @click="$store.state.viewMode='calendar'">Calendar</button>
            <button v-if="menu" @click="$store.state.viewRoot=-1">ResetViewRoot</button>
        </div>
        <!-- CARD VIEW -->
        <div v-if="$store.state.viewMode=='cards'" style="display:flex; flex-wrap: wrap;  margin:25px;">
            <button style="position:fixed; top: 10px; right:10px; width:100px; height:100px; opacity:0.5" @click="$store.dispatch('createTask', {name:'newTask'})">+</button>
            <div class="task" @mousedown="mouseDown($event, task)" :style="{backgroundColor: task.color, opacity: task.done ? 0.5 : 1}" v-for="task in tasksTree" :key="task">
                <!--input type="checkbox" :checked="task.done" @click="task.done=!task.done"-->
                <input class="big-input" @input="task.name=$event.target.value" :value="task.name">
                <input type="color" :value="task.color" @input="task.color=$event.target.value">
                <br>
                <!--v-select label="name" :options="$store.state.tasks"></v-select-->
                <!--select @change="task.parentId=$event.target.value">
                    <option v-for="parent in $store.state.tasks" :key="parent" :value="parent">{{$store.getters.Task(parent)}}</option>
                </select-->                        
                <select @change="task.type=$event.target.value">
                    <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
                </select>            
                
                <select @change="task.leader=$event.target.value">
                    <option v-for="people in $store.state.people" :key="people" :value="people">{{people}}</option>
                </select>
                <br>
                <label class="dateButton">
                    <input type="date" class="dateButton" @change="task.due=$event.target.value">
                    <button id="calendar_text" class="dateButton">📅</button>
                </label>
                Due in: {{ task.due ? (new Date(task.due).getDate() - new Date().getDate()) + 1 : "" }} days                
                
                <br>
                Excitement:<input class="number" type="number" :value="task.excitement" @input="task.excitement=$event.target.value">
                <br>
                Priority:<input class="number" type="number" :value="task.priority" @input="task.priority=$event.target.value">
                <br>
                Estimated Duration: <input class="number" type="number" :value="task.estimatedDuration" @input="task.estimatedDuration=$event.target.value">
                <br>
                Duration: {{task.actualDuration}}min
                <br>
                Sub Tasks:
                <ul>
                    <li v-for="child in task.tasks" :key="child">{{child.name}}</li>
                </ul>
                <button v-if="!task.done && !task.started" @click="startTask(task)">Start Task</button>
                <button v-if="!task.done && task.started" @click="stopTask(task, false)">Stop Task</button>
                <button @click="stopTask(task, true)">Done!</button>
                <button @click="$store.dispatch('createTask', {name:'Child'+task.lastId, parent:task})">add sub-task</button>
                <br>
                       
            </div>            
        </div>
        <!-- TREE VIEW -->
        <div v-if="$store.state.viewMode=='tree'">
            <div class="task" @mousedown="mouseDown($event, task)" :style="{position:'relative', backgroundColor: task.color, opacity: task.done ? 0.5 : 1}" v-for="task in tasksTree" :key="task">
                <button @click="$store.state.viewRoot=task.id" style="position:absolute; right:0px; top:0px">=></button>
                <input type="checkbox" :checked="task.done" @click="task.done=!task.done">
                <input class="big-input" @input="task.name=$event.target.value" :value="task.name">                
                <div class="task" @mousedown="mouseDown($event, child)" :style="{backgroundColor: child.color, opacity: child.done ? 0.5 : 1}" v-for="child in task.tasks" :key="child">
                    <input type="checkbox" :checked="child.done" @click="child.done=!child.done">
                    <input class="big-input" @input="child.name=$event.target.value" :value="child.name">                
                </div>
                <button @click="$store.dispatch('createTask', {name:'Child'+task.lastId, parent:task})">Add Child</button>
            </div>
        </div>        
        <!-- CALENDAR VIEW -->
        <calendar v-if="$store.state.viewMode=='calendar'" class="background" />
        <save-load v-if="$store.state.viewMode=='saveload'"/>
    </div>
</template>

<script>
import calendar from "./Calendar.vue"
import PostService from "./PostService.js";
import saveLoad from "./SaveLoad.vue"
export default {    
    name: "app",
    data(){
        return{
            dragging:"", menu: false
        }
    },
    components:{
        calendar, saveLoad
    },
    computed: {
        tasks: function(){     
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
            let r = this.$store.getters.viewRoot
            let ret = [r]
            while (r.parent){
                r = r.parent
                ret = [r.parent, ...ret]
            }
            return ret
        }
    },    
    mounted(){     
        this.$store.dispatch('loadChart')
        document.addEventListener('keydown', this.keyDown)
        //this.$store.dispatch('saveChart')        
        //this.$store.dispatch('createTask', {name:'task1', due: new Date('2020-1-21')}) 
        //this.$store.dispatch('createTask', {name:'task2'})         
    },
    methods:{                     
        mouseDown(ev){
            this.dragging=ev.target
        },
        setAllTasks(){
            this.$store.state.viewFilters.started=[] 
            this.$store.state.viewFilters.done=[false]
        },
        SetDoneTasks(){
            this.$store.state.viewFilters.done=[true]
            this.$store.state.viewFilters.started=[]
        },
        setCurrentTasks(){
            this.$store.state.viewFilters.started=[true] 
            this.$store.state.viewFilters.done=[false]
        },
        startTask(task){
            task.current=true
            task.started= Date.now()
        },
        stopTask(task, done){            
            let t = new Date().getTime() - new Date(task.started).getTime()
            task.actualDuration += Math.round(t/1000/60)
            task.started = false
            if (done) task.done=true
        },
        keyDown(ev){            
            if(ev.ctrlKey && ev.key=='z'){
                if (ev.shiftKey)
                    this.$store.dispatch('redo')
                else
                    this.$store.dispatch('undo')
            }
        }
    },
}

</script>
<style lang="scss">
@use "./CSS/main.scss" as *;
@use "vue-select/src/scss/vue-select.scss" as *;
input.number{
    width:38px;
}
.task{    
    outline:black solid 1px; 
    background-color: lavender; 
    color:black; 
    width:fit-content;
    padding:7px;
    margin:10px;
    flex-basis: content;    
}
input[type=color]{
    width:20px;    
}
.big-input{
    font-size: 26px;
    font-weight: bold;
    //width:fit-content;
}
select{
    height:22px;
}
select:hover{
    height:fit-content;
}
input, select, option{
    background-color: transparent;
}


label.dateButton {
  display: inline-block;
  position: relative;
  line-height: 0;
}
input.dateButton {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  border: 0;
  overflow: hidden;
}
input.dateButton::-webkit-calendar-picker-indicator {
  position: absolute;
  top: -150%;
  left: -150%;
  width: 300%;
  height: 300%;
  cursor: pointer;
}

</style>