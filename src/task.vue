<template>
<div style="position:flex" :class="{task: true, done: task.done, moving: task.id==reorderingTasks, reordering: reorderingTasks}">
    <div v-if="reorderingTasks==0" @contextmenu.prevent="$emit('start-reorder-task', task.id)" class="taskTopRight">
        <div @click="$store.dispatch('deleteTaskById', task.id)" style="grid-area: 1 / 7"><i style="color:black;" class="fas fa-times-circle"></i></div>        
        <div @click="doClick" v-if="collapsed" style="grid-area: 1 / 6"><i style="color:black;" class="fas fa-chevron-circle-down"></i></div>
        <div @click="doClick" v-if="!collapsed" style="grid-area: 1 / 6"><i style="color:black;" class="fas fa-chevron-circle-left"></i></div>        
        <div style="grid-area: 1 / 5"><date-button :task="task"/></div>
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
    <button v-if="reorderingTasks && task.parent.tasks[0].id == taskId && reorderingTasks!=taskId" class="reorderHereFirst" @click="$emit('do-reorder-task', 0)">move task here</button>
    
    <div v-if="collapsed" style="margin-top: 30px;">
        <div v-for="child in task.tasks" :key="child" :class="{subtask: true, done: child.done}"             
            :style="{backgroundColor: child.color, display:'grid'}" 
        >
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
        </div>
        <div style="display: inline-block; text-align:center; width:96%; margin:4px; border-radius:10px; border: 1px #999 solid; height:20px; background-color: #DDD" @click="$store.dispatch('createTask', {name:'Child'+task.lastId, parent:task})">
            +
        </div>                    
        <!--input type="color" :value="task.color" @input="set(task, 'color', $event.target.value)"-->                    
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
        <div style="width:fit-content; display: inline-block;">
            <div v-for="i in 7" :key="i" @contextmenu.prevent="task.excitement=0" @click="task.excitement=i" :style="{display:'inline-block', color: task.excitement != i ? '#AAA' : 'black'}">                            
            <i :class="{'far':true, 'fa-tired': i==1, 'fa-angry': i==2, 'fa-frown': i==3, 
                'fa-meh': i==4, 'fa-smile': i==5, 'fa-grin': i==6, 'fa-laugh-beam': i==7}"> </i>            
            </div><br>            
            <div v-for="i in 7" :key="i"    @contextmenu.prevent="task.priority=0" @click="task.priority=i" :style="{display:'inline-block', color: task.priority > i-1 ? priorityColors[task.priority] : '#AAA'}"><i class="fas fa-exclamation-circle"></i></div>
        </div>        
        <div style="display: inline-block; position:relative; width:fit-content">            
            <div v-for="j in [1,2]" :key="j" style="width:fit-content; margin-left: 12px">
                <div v-for="i in 10" :key="i"    @contextmenu.prevent="task.estimatedDuration=0" @click="task.estimatedDuration=i+10*j" :style="{display:'inline-block', color: task.estimatedDuration < i+10*j ? '#AAA' : 'black'}"><i class="far fa-clock"></i>
                </div> 
            </div>
        </div>
        <!-- Estimated Duration: <input class="number" type="number" :value="task.estimatedDuration" @input="set(task, 'estimatedDuration', $event.target.value)"> -->
        <br>      
        Actual Duration: {{formatTime(task.actualDuration)}}<br>
            Tags: 
        <div style="display:flex">
        <div v-for="tag in task.tags" :key="tag" style="margin-right:8px;">
            <div @click="clearTag(tag)" style="grid-area: 1 / 7">
                <i style="color:black;" class="fas fa-times-circle"></i>
                <button class="unbutton" @click.stop="searchTag(tag)">{{tag}}</button>
            </div>                    
        </div>
        <input @blur="(ev)=>{if (ev.currentTarget.value != ''){addTag(ev); debugger;}}" @keydown="(ev)=>{if (ev.key==',' || ev.key=='enter'){ev.preventDefault(); ev.target.blur()}}">
        </div>
    </div>                    
    <button v-if="reorderingTasks && reorderingTasks!=taskId" class="reorderHere" @click="$emit('do-reorder-task', task.id)">move task here</button>
    <button v-if="reorderingTasks && reorderingTasks==taskId" class="reorderHere" @click="$store.dispatch('deleteTaskById', taskId); $emit('do-reorder-task')">DELETE TASK</button>
</div>
</template>
<script>
//import { getTextWidth } from "./getTextWidth";
import {DateTime} from "./RossUtils"
import dateButton from "./dateButton"
export default {
    name: "task",
    components: {dateButton},
    props: { taskId: Number, reorderingTasks: Number, collapseAll:Number},
    data(){        
        return {
            collapsed: false, dblClickTimer: undefined, clickCount: 0,
            priorityColors: ['','#006400', '#008000', '#667C3F', '#D2691E', '#EE8700', '#FF6D00', '#ff1744']
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
        set(obj, prop, value){
            obj[prop] = value
            this.$store.dispatch('addUndo')
        },
        addTag(ev){            
            this.task.tags.add(ev.target.value)
            this.$store.state.tags.add(ev.target.value)
            ev.target.value=""
        },
        clearTag(tag){
            this.task.tags.delete(tag)
        },
        
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
    min-width: min(95vw, 350px);
    min-height:40px;
    padding:7px;
    margin:10px;
    border-radius: 10px;
    flex-basis: content;
    z-index:10;    
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
    min-width: 40%;
    height:25px;
}
.medium-input{
    font-size: 15px;
    font-weight: bold;
    max-width:80vw;
    min-width: 60%;
    width:90%;
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
.unbutton{
    background: transparent;
    border:none;
    padding-left:5px;
    padding-right:2px;
}
.taskTopRight{
    width:100%; 
    //height:50px; 
    //border:red solid 1px; 
    right:0px; 
    top:0px; 
    display: grid;
    float:right;    
    div, button{
        width:25px;
        height: 25px;        
        padding-top:0px;
        padding-bottom:0px;
        text-align:center;
    }    
}
</style>