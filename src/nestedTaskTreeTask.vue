<template>
    <div v-show="hidden" @click.stop>
    <button @click="collapsed=!collapsed">{{collapsed ? "+" : "-"}}</button>    
    <button :disabled="reparentingMe" :style="{'border': reparentingMe ? '1px #99F solid' : 'none'}" @click="$emit('reparent-task', task.id)">{{task.name}}</button>
    <nested-task-tree-task :doHide="hideSubtasks" :reparentingId="reparentingId" @reparent-task="(id)=>$emit('reparent-task', id)" @hide="(t)=>hide=t" style="margin-left:40px;" v-for="child in subtasks" :key="child" :task="child" :searchParents="searchParents"/>
    </div>
</template>
<script>
export default {
    name: "nested-task-tree-task",
    props:{task: Object, searchParents: String, reparentingId:Number, doHide:Boolean},
    data(){
        return {
            hide:true, collapsed: false, hideSubtasks: false
        }
    },
    mounted(){                
    },
    computed:{        
        reparentingMe: function(){
            if (this.reparentingId == this.task.id){                
                return true
            }
        },
        hidden: function(){                                              
            if (this.doHide)return true
                if (this.reparentingMe){
                    this.hideSubtasks=true; 
                    return true;
                }               
            //if searching...
            if (!this.searchParents ==""){
                //if the name or tag contains search term...
                if(task.name.includes(this.searchParents) || task.tags.has(this.searchParents))
                {                    
                    //unhide and tell our parents to un-hide!
                    this.$emit('hide', false)        
                    this.hide=false;
                } 
            }            
            return this.hide
        },
        subtasks: function(){
            if (this.collapsed) return                        
            return this.task.tasks
        }    
    }
}
</script>
<style scoped>
button{
    background-color: transparent;
    border: none;
    color:white;
    padding: 2px 5px;
    line-height: 10px;
}
button:focus{
    border: none;
}
button:disabled{
    color:#AAA;
    border-radius:10px;
}
</style>