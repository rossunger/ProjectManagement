<template>
<div style="position:flex;" :class="{task: true, done: task.done, moving: task.id==reorderingTasks, reordering: reorderingTasks}">    
    <div v-if="reorderingTasks==0" class="taskTopRight">
        <div @click="doDeleteTask($event, task.id)" style="grid-area: 1 / 7"><i style="color:black;" class="fas fa-times-circle"></i></div>        
        <div @click="doClick" v-if="collapsed" style="grid-area: 1 / 6"><i style="color:black;" class="fas fa-chevron-circle-down"></i></div>
        <div @click="doClick" v-if="!collapsed" style="grid-area: 1 / 6"><i style="color:black;" class="fas fa-chevron-circle-left"></i></div>        
        <div style="grid-area: 1 / 5">
            <date-button :task="task" />
        </div>
        <button style="grid-area: 1 / 4" class="unbutton" v-if="!task.done" @click="stopTask(task, true)"><i class="fas fa-clipboard-check"></i></button>
        <button style="grid-area: 1 / 3"  class="unbutton" v-if="!task.done && !task.started" @click="startTask(task)"><i class="fas fa-stopwatch"></i></button>    
        <button style="grid-area: 1 / 3" class="unbutton" v-if="!task.done && task.started" @click="stopTask(task, false)"><i class="fas fa-pause"></i></button>        
        <svg viewBox="0 0 20 20" v-if="task.done" @click="task.done=false">
            <text x="0" y="18">{{ formatTime(task.actualDuration)}}</text>
        </svg>               
        <button class="unbutton" v-if="task.done" @click="task.done=false"><i class="fas fa-undo-alt"></i></button>                        
        <button style="grid-area: 1 / 1" class="unbutton" @click="$emit('stop-transitions'); $store.state.viewRoot=task.id"><i class="fas fa-search-plus"></i></button>
         
        <input style="grid-column: 2; grid-row:1" :ref="'t'+task.id" class="big-input" @change="set(task, 'name', $event.target.value);" :value="task.name">                              
    </div>    
        <h2 style="text-align:center" v-if="reorderingTasks!=0" class="big-input">{{task.name}}</h2>
        <button style="position:absolute; top:3px; right:3px; border-radius:10px" v-if="reorderingTasks!=0" @click="$emit('reparent-task', taskId)">Reparent</button>
    <button v-if="reorderingTasks && task.parent.tasks && task.parent.tasks[0].id == taskId && reorderingTasks!=taskId" class="reorderHereFirst" @click="$emit('do-reorder-task', 0)">move task here</button>
    
    <div v-if="collapsed" style="margin-top: 30px;">
        <!-- sub tasks
            <task v-for="child in task.tasks" :key="child" :class="{done: child.done}"             
            :style="{backgroundColor: child.color, display:'grid', 'zmargin': '0px', 'padding-bottom': '0px'}"         
            :taskId="child.id"                 
            @stop-transitions="$emit('stop-transitions');"
            @start-reorder-task="$emit('start-reorder-tasl')"
            @do-reorder-task="$emit('do-reorder-task')"
            @reparent-task="$emit('reparent-task')"            
            @collapse-all="(t)=>$emit('collapse-all', t)"
            :reorderingTasks="reorderingTasks"
            :collapseAll="collapseAll"                  
        / -->
        <!--
            <div @click="$store.dispatch('deleteTaskById', child.id)" style="grid-area: 1 / 6"><i style="color:black;" class="fas fa-times-circle"></i></div>                    
            <div style="grid-area: 1 / 5"><date-button :task="child"/></div>
            <button style="grid-area: 1 / 4" class="unbutton" v-if="!child.done" @click="stopTask(child, true)"><i class="fas fa-clipboard-check"></i></button>
            <button style="grid-area: 1 / 3"  class="unbutton" v-if="!child.done && !child.started" @click="startTask(child)"><i class="fas fa-stopwatch"></i></button>    
            <button style="grid-area: 1 / 3" class="unbutton" v-if="!child.done && child.started" @click="stopTask(child, false)"><i class="fas fa-pause"></i></button>        
            <svg style="grid-area: 1 / 3" viewBox="0 0 20 20" v-if="task.done" @click="child.done=false">
                <text x="0" y="18">{{ formatTime(child.actualDuration)}}</text>
            </svg>               
            <button class="unbutton" style="grid-area: 1 / 3" v-if="child.done" @click="child.done=false"><i class="fas fa-undo-alt"></i></button>                        
            <input :ref="'t'+child.id" class="medium-input" @input="set(child, 'name', $event.target.value)" :value="child.name">                                              
            <button style="grid-area: 1 / 1" class="unbutton" @click="$emit('stop-transitions'); $store.state.viewRoot=child.id"><i class="fas fa-search-plus"></i></button>                                
        
        </div -->   
        <!--div style="display: inline-block; text-align:center; width:96%; margin:4px; border-radius:10px; border: 1px #999 solid; height:20px; background-color: #DDD" @click="$store.dispatch('createTask', {parent:task})">
            +
        </div-->      
        <task-details :task="task" />
        
    </div>                    
    <button v-if="reorderingTasks && reorderingTasks!=taskId" class="reorderHere" @click="$emit('do-reorder-task', task.id)">move task here</button>
    <button v-if="reorderingTasks && reorderingTasks==taskId" class="reorderHere" @click="$emit('do-reorder-task'); $store.dispatch('deleteTaskById', taskId);">DELETE TASK</button>
</div>
</template>
<script>
//import { getTextWidth } from "./getTextWidth";
import {DateTime} from "./RossUtils"
import selectBox from "./selectBox"
import dateButton from "./dateButton"
import taskDetails from './taskDetails'
export default {
    name: "task",
    components: {dateButton, taskDetails, selectBox},
    props: { taskId: Number, reorderingTasks: {type: Number, default: 0}, collapseAll:{type: Number, default: 0}, startCollapsed: {type:Boolean, default:false }},
    data(){        
        return {
            collapsed: false, dblClickTimer: undefined, clickCount: 0,            
        }
    },    
    computed:{
        task: function(){
            return this.$store.getters.taskById(this.taskId)
        }
    }, 
    watch:{
        collapseAll:{
            handler(i){
                if(i%2==0)this.collapsed=true
                else this.collapsed = false
            }
        }
    },
    mounted(){
        this.collapsed=this.startCollapsed;
    },
    methods:{
        doClick(ev){            
            this.clickCount++   
            if (this.clickCount<2)
                this.collapsed=!this.collapsed   
            if(!this.dblClickTimer)
                this.dblClickTimer = setTimeout((v) => {                
                    if (v.clickCount>1){                    
                        v.$emit('collapse-all', !v.collapsed)             
                    }                              
                    v.clickCount = 0;
                    v.dblClickTimer = undefined
                }, 400, this);
        },
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
            task.started= setInterval((task, dispatch)=>{                
                if(task && task.started)
                    task.actualDuration +=1
                else{
                    clearInterval(task.started)                    
                }
            }, 1000, task, this.$store.dispatch)

        },
        stopTask(task, done){                        
            clearInterval(task.started)
            task.started = false
            if (done) task.done=true
        },
        /*
        getTextWidth(task, element){
            let t = task.name
            //hack to make reactivity work: 
            if (element===undefined){                
                task.name = ""
                task.name = t                
            }                     
            if(element ===null)return
            return getTextWidth(t,element);            
        },*/
        formatTime(t){            
            return DateTime.formatTime(t)            
        },                                
        doDeleteTask(ev, id){            
            if(ev.ctrlKey)
                this.$store.dispatch('deleteTaskById', id)
            else if(confirm('Are you sure you want to delete this task?'))
                this.$store.dispatch('deleteTaskById', id)
        },
        set(obj, prop, value){
          obj[prop] = value
          this.$store.dispatch('addUndo')
        }
        
    }
}
</script>
<style scoped lang="scss">
@use "./CSS/task.scss" as *;
</style>