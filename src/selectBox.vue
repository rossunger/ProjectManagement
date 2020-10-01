<template>
<div>    
    <select :disabled="disabled" v-if="showOne" @change="$emit('changed', $event.target.value)">
        <option v-for="item in items" :key="item" :selected="item[textParameter] == selected[0][textParameter]" :value="item[textParameter]">{{item[textParameter]}}</option>
    </select>
    <div v-if="!showOne">
        <div v-for="item in items" :key="item" :style="{'background-color': selected.includes(item) || selected.includes(item.name) ? '#DDF' :'white' }">        
            <input v-if="!disabled" type="checkbox" 
            @click="doClickMulti($event, item)" 
            :id="item[textParameter]" :checked="this.convertedToObject ? selected.includes(item.name) : selected.includes(item)" 
            :value="isArray ? item : item[textParameter]">
            <label :for="item[textParameter]">{{item[textParameter]}}</label>
        </div>
    </div>
</div>


</template>
<script>
export default {
    name:'select-box',
    props:{ 
        array: {type: Array, default: []}, 
        obj: {type:Object, default: {}}, 
        showOne: {type: Boolean, default: true}, 
        selected: {type: Array, default: [{name:""}]},
        disabled: {type: Boolean, default: false},
        textParameter: {type:String, default: 'name'},
        sorted: {type: String, default: 'asc'}        
    },
    computed:{
        items: function (){            
            let ret 
            this.convertedToObject = false                       
            if (this.array.length > 0){
                this.isArray = true                                                                
                if (this.array[0].name)
                    ret = this.array                
                else{
                    this.convertedToObject = true
                    ret = []                    
                    this.array.forEach(a=>{
                        ret.push({name: a})
                    })
                }                    
                
            }
            if (Object.keys(this.obj).length > 0){
                this.isArray = false
                ret = this.obj
            }       
            if (ret && this.sorted=='asc'){                
                ret.sort((a,b)=>{                
                    return a.name>b.name?1 : -1
                })
            }         
            return ret || []
        }
    },
    data(){
        return{
            isArray: false, convertedToObject: false
        }
    },   
    methods:{
        doClickMulti(ev, item){               
            let ret
            ret = [...this.selected]                        
            if (ev.target.checked && !ret.includes(item)){                
                ret.push(this.convertedToObject ? item.name : item)}
            else {
                let l = ret.indexOf(item)                
                ret.splice(l, 1)
            }                                    
            this.$emit('changed-multi', ret)
        }
    },    
}
</script>
<style scoped lang="scss">
div{
    border: 1px solid #AAC;    
    //color:darkgrey;
}
select{
    width:100%;
    height:100%;    
}
option{
    width:100%;
}
label{
    width:100%;
}
</style>