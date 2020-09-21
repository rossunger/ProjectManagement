<template>
<div @click.self="doClick" @contextmenu.self.prevent="$emit('start-reorder-task', task.id)" :class="{moving: task.id==reorderingTasks, reordering: reorderingTasks}">
    <button v-if="reorderingTasks && task.parent.tasks[0].id == taskId && reorderingTasks!=taskId" class="reorderHereFirst" @click="$emit('do-reorder-task', 0)">move task here</button>
    <button class="zoomButton" @click="$emit('stop-transitions'); $store.state.viewRoot=task.id" style="left:0px; top:0px">⇒</button>                             
    <input :ref="'t'+task.id" class="big-input" @change="set(task, 'name', $event.target.value);" :value="task.name" :style="{width: getTextWidth(task, $refs['t'+task.id])+10 +'px'}">                      
    <div>
    <date-button :task="task"/>        
    <svg viewBox="0 0 20 20" v-if="!task.done && task.started" @click="stopTask(task, false)">
        <text x="0" y="18">&#10074;&#10074;</text>        
    </svg>
    <svg viewBox="0 0 22 22" v-if="!task.done && !task.started" @click="startTask(task)">
        <text x="0" y="18">&#9201;</text>        
    </svg>                
    <svg viewBox="0 0 20 20" v-if="!task.done" @click="stopTask(task, true)">
        <text x="0" y="17">✔</text>
    </svg>
    <svg viewBox="0 0 20 20" v-if="task.done" @click="task.done=false">
        <text x="0" y="18">{{ formatTime(task.actualDuration)}}</text>
    </svg>               
    <svg viewBox="0 0 20 20" v-if="task.done" @click="task.done=false">
        <text x="0" y="18">&#8634;</text>
    </svg>                        
    </div>
    <div v-if="collapsed">
        <div v-for="child in task.tasks" :key="child" :class="{subtask: true, done: child.done}"             
            :style="{backgroundColor: child.color}" 
        >
            <button class="zoomButton" @click="$emit('stop-transitions'); $store.state.viewRoot=child.id" style="">⇒</button>
            <date-button :task="child"/>                 
            <input type="checkbox" :checked="child.done" @click="set(child, 'done', !child.done)">
            <input :ref="'t'+child.id" class="medium-input" @input="set(child, 'name', $event.target.value)" :value="child.name" :style="{width: getTextWidth(child, $refs['t'+child.id])+10 +'px'}">                                              
        </div>
        <div style="text-align:center; width:96%; margin:4px; border-radius:10px; border: 1px #0005 solid; background-color: #DDDD" @click="$store.dispatch('createTask', {name:'Child'+task.lastId, parent:task})">+
        </div>                    
        <input type="color" :value="task.color" @input="set(task, 'color', $event.target.value)">                    
        <br>
        <!--v-select label="name" :options="$store.state.tasks"></v-select-->
        <!--select @change="task.parentId=$event.target.value">
            <option v-for="parent in $store.state.tasks" :key="parent" :value="parent">{{$store.getters.Task(parent)}}</option>
        </select-->                        
        <select @change="set(task, 'type', $event.target.value)">
            <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
        </select>            
        
        <select @change="set(task, 'leader', $event.target.value)">
            <option v-for="people in $store.state.people" :key="people" :value="people">{{people}}</option>
        </select>
        <br>
        <br>
        Excitement:<input class="number" type="number" :value="task.excitement" @input="set(task, 'excitement', $event.target.value)">
        <br>
        Priority:<input class="number" type="number" :value="task.priority" @input="set(task, 'priority', $event.target.value)">
        <br>
        Estimated Duration: <input class="number" type="number" :value="task.estimatedDuration" @input="set(task, 'estimatedDuration', $event.target.value)">
        <br>      
        Actual Duration: {{formatTime(task.actualDuration)}}                                                  
    </div>                    
    <button v-if="reorderingTasks && reorderingTasks!=taskId" class="reorderHere" @click="$emit('do-reorder-task', task.id)">move task here</button>
    <button v-if="reorderingTasks && reorderingTasks==taskId" class="reorderHere" @click="$store.dispatch('deleteTaskById', taskId); $emit('do-reorder-task')">DELETE TASK</button>
</div>
</template>
<script>
import { getTextWidth } from "./getTextWidth";
import {DateTime} from "./RossUtils"
import dateButton from "./dateButton"
export default {
    name: "task",
    components: {dateButton},
    props: { taskId: Number, reorderingTasks: Number, collapseAll:Number},
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
    methods:{
        doClick(ev){            
            this.clickCount++            
            if(!this.dblClickTimer)
                this.dblClickTimer = setTimeout((v) => {                
                    if (v.clickCount>1){                    
                        v.$emit('collapse-all', v.collapsed)             
                    }else      
                        v.collapsed=!v.collapsed   
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
        getTextWidth(task, element){
            let t = task.name
            //hack to make reactivity work: 
            if (element===undefined){                
                task.name = ""
                task.name = t                
            }                     
            if(element ===null)return
            return getTextWidth(t,element);            
        },
        formatTime(t){            
            return DateTime.formatTime(t)            
        },        
        set(obj, prop, value){
            obj[prop] = value
            this.$store.dispatch('addUndo')
        }
    }
}
</script>
<style scoped lang="scss">
input.number{
    width:38px;
}
.task{    
    border:black solid 1px; 
    background-color: lavender; 
    color:black; 
    width:fit-content;
    max-width: 95vw;
    min-width: min(95vw, 350px);;
    padding:7px;
    margin:10px;
    border-radius: 10px;
    flex-basis: content;
    $p: &;    
}
.subtask{    
    border:black solid 1px; 
    background-color: lavender; 
    color:black; 
    width:96%;
    max-width: 95vw;
    padding:7px;
    margin:2%;
    border-radius: 10px;
    flex-basis: content;     
}
.done{
    opacity: 0.5;
}
input[type=color]{
    width:20px;    
}
.big-input{
    font-size: 18px;
    font-weight: bold;
    max-width: 90vw;
    min-width: 60%;
}
.medium-input{
    font-size: 15px;
    font-weight: bold;
    //width:fit-content;
}
.zoomButton{
    padding:0px;
    border-radius:50%;
    border:none;
    background-color:transparent
}
.reorderHere{    
    position:absolute;
    width: 100%;
    left:0px;
    bottom:-15px;   
    background-color: slateblue;
    border: 2px solid black;
    color:white;        
}
.reorderHereFirst{    
    position:absolute;
    width: 100%;
    left:0px;
    top:-15px;   
    background-color: slateblue;
    border: 2px solid black;
    color:white;        
}
.moving{
    transition: 0.3s;
    border: 2px orange solid;
    transform: rotate(5deg);
}
.reordering{
    margin-bottom: 25px;
}
svg{
    width:20px; 
    height:20px;
    margin-right:2px;
}
</style>