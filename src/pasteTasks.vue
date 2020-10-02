<template>
<div>
    <div v-if="step==0">
        <h1>Step 1: Paste</h1>
        <textarea ref="txt" /><button @click="step=1; textToTasks()">Next</button>
    </div>

    <div v-if="step==1">
        <h1>Step 2: Edit tasks</h1>        
        <div class="task" v-for="task in newTasks" :key="task" @click="collapsed.has(task) ? collapsed.delete(task) : collapsed.add(task)">  
            <div  class="button" @click.stop="doDeleteTask($event, task)" style="float:right"><i style="color:black;" class="fas fa-times-circle"></i></div>        
            <div class="button" v-if="collapsed.has(task)" style="float:right"><i style="color:black;" class="fas fa-chevron-circle-down"></i></div>
            <div class="button" v-if="!collapsed.has(task)" style="float:right"><i style="color:black;" class="fas fa-chevron-circle-left"></i></div>        
            <input class='big-input' @click.stop :value="task.name" @input="task.name=$event.target.value">
            <date-button @click.stop :task="task" style="float:right"/>
            <i @click.stop>
            <task-details v-if="collapsed.has(task)" :task="task"/>            
            </i>
        </div>
        <button @click="step=0">Back</button><button @click="commitTasks">Submit</button>        
    </div>
</div>

</template>
<script>
import {TaskTemplate} from './consts'
import dateButton from "./dateButton"
import taskDetails from "./taskDetails"
import _ from 'lodash'
export default {
    name:'pasteTasks', components:{dateButton, taskDetails},
    mounted(){
        this.collapsed = new Set();        
    },
    computed:{
        newTasks: function(){
            return this.tasks
        }
    },
    data(){
        return{
            step: 0, tasks: [], collapsed: undefined
        }        
    },
    methods:{
        async textToTasks(){ 
            this.tasks=[]
            let txt = this.$refs['txt'].value
            let i = txt.split('=>')            
            for (let j = 0; j<i.length; j++){
                //get rid of empty ones
                if (i[j]=="") i.splice(j,1)
                //if @leader
                let leader="";
                let taskName=""                
                if (i[j].includes('@')){          
                    let k = i[j].trim().indexOf(' ') //end of name
                    leader = i[j].trim().slice(1, k) || ""  //leaders name            
                    leader = this.$store.getters.personByName(leader) || this.$store.getters.committeeByName(leader) //get the actual person object                                        
                    taskName = i[j].trim().slice(k+1).trim() // get the task name                                        
                }else{
                    taskName = i[j].trim()
                }
                
                this.tasks.push(_.cloneDeep(TaskTemplate))
                this.tasks[this.tasks.length-1].name = taskName
                this.tasks[this.tasks.length-1].leader = leader                   
            }                                  
        },
        commitTasks(){
            //this.$store.state.tasks= []
            this.tasks.forEach(t=>{                
                this.$store.dispatch('createTask', {name: t.name, leader: t.leader, due: t.due, excitement: t.excitement, priority: t.priority, estimatedDuration: t.estimatedDuration})                                                
            })
            this.$store.dispatch('doNavigate', '/tasks')
        },
        doDeleteTask(ev, task){            
            if(ev.ctrlKey)
                this.tasks.splice(this.tasks.indexOf(task), 1)
            else if(confirm('Are you sure you want to delete this task?'))
                this.tasks.splice(this.tasks.indexOf(task), 1)
        }
    }
}
</script>
<style scoped lang="scss">
@use "./CSS/task.scss" as *;
div{
    margin:20px;
    color:white;
}
div.button{
    width:25px;
    height:25px;
    padding-top:0px;
        
        text-align:center;
        margin:2px;
}
h1{
    color:white
}
textarea{
    width:100%;
}
</style>