<template>                  
        <!--input type="color" :value="task.color" @input="set(task, 'color', $event.target.value)"-->                    
        <br>
        <!--v-select label="name" :options="$store.state.tasks"></v-select-->
        <!--select @change="task.parentId=$event.target.value">
            <option v-for="parent in $store.state.tasks" :key="parent" :value="parent">{{$store.getters.Task(parent)}}</option>
        </select-->                        
        <select @change="set(task, 'type', $event.target.value)">
            <option v-for="type in $store.state.taskTypes" :key="type" :value="type">{{type}}</option>
        </select>            
        
        <select @change="set(task, 'leader', $store.getters.personByName($event.target.value) || $store.getters.committeeByName($event.target.value) )">
            <option v-for="person in [...$store.state.people, ...$store.state.committees]" :key="person" :value="person.name" :selected="task.leader==person">{{person.name}}</option>
        </select>
        <br>
        <br>        
        <div style="width:fit-content; display: inline-block;">
            <div v-for="i in 7" :key="i" @contextmenu.prevent="task.excitement=0" @click="task.excitement=i" :style="{display:'inline-block', color: task.excitement != i ? '#AAA' : priorityColors[8-task.excitement]}">                            
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
        <span>Description: </span><span style="float:right">{{formatTime(task.actualDuration)}}</span><br>
        <textarea :value="task.description" @input="task.description = $event.target.value" />
            Tags: 
        <div style="display:flex">
        <div v-for="tag in task.tags" :key="tag" style="margin-right:8px;">
            <div @click="clearTag(tag)" style="grid-area: 1 / 7">
                <i style="color:black;" class="fas fa-times-circle"></i>
                <button class="unbutton" @click.stop="searchTag(tag)">{{tag}}</button>
            </div>                    
        </div>
        <input style="background-color:#0001" @blur="(ev)=>{if (ev.currentTarget.value != ''){addTag(ev); }}" @keydown="(ev)=>{if (ev.key==',' || ev.key=='enter'){ev.preventDefault(); ev.target.blur()}}">
        </div>
</template>
<script>
import {DateTime} from "./RossUtils"
export default {
    name: 'task-details', 
    props: {task: Object},
    methods:{
        set(obj, prop, value){
            obj[prop] = value
            this.$store.dispatch('addUndo')
        },
        formatTime(t){            
            return DateTime.formatTime(t)            
        },        
        addTag(ev){            
            this.task.tags.add(ev.target.value)
            this.$store.state.tags.add(ev.target.value)
            ev.target.value=""
        },        
        clearTag(tag){
            this.task.tags.delete(tag)
        },
        searchTag(tag){
            this.$store.state.viewFilters.tags = [tag]
        }
    },
    data(){
        return{
            priorityColors: ['','#006400', '#008000', '#667C3F', '#D2691E', '#EE8700', '#FF6D00', '#ff1744']
        }
    }
}
</script>
<style scoped lang="scss">
    @use "./CSS/task.scss" as *;
</style>