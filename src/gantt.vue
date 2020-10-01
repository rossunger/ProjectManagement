<template>
<h1 style="color:white; margin-left:2vw">Gantt</h1>
<div style="width: 95vw; overflow-x:scroll; position: sticky; left:2vw; margin-top: 3vh; display:grid">    
    <div class='container'>        
        <div v-for="(task,j) in $store.getters.allTasks" :key="task" :style="{overflow:'hidden', position: 'sticky', left: '0px', 'grid-column':1, 'grid-row':(j+2)}">{{task.name}}</div>        
        <div v-for="i in 50" :key="i" class='ganttItem' :style="{'grid-row':1,'grid-column': i+1}">
        {{i}}
        <div v-for="(task,j) in $store.getters.allTasks" :key="task" :style="{'grid-column':i, 'grid-row':(j+2)}">{{task.done ? '[X]' : '[]'}}</div>
        </div>                
    </div>
</div>
</template>
<script>
import selectBox from './selectBox'
export default {
    name: 'gantt', components:{selectBox},    
    methods:{    
    },
    computed:{        
        
    },
    data(){
        return{            
        }
    }
}
</script>
<style scoped lang="scss">
.container{
    width:fit-content;
    background-color: #EEEC;
    overflow: scroll;    
    height:90vh;
    scroll-behavior: smooth;
    display: grid;
    grid-template-columns: 250px repeat(50, 30px);
    grid-template-rows: repeat(50, 20px);    
}
.container::-webkit-scrollbar{
    display:none;
}
.ganttItem{
    display:inline-block; 
    width:30px; 
    text-align:center; 
        border: red 1px solid;
}
</style>