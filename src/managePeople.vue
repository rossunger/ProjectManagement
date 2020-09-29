<template>
<div> 
    <div>
        <h1>People</h1>  <div class="button" @click="$store.dispatch('addPerson')">+</div><br>
        <div class="scrollingContainer" style="overflow:scroll; position: relative; max-width:95vw; display:grid; grid-template-columns: repeat(50, 300px); overscroll-behavior: auto;">
        <div class="person" v-for="p in $store.state.people.filter(p=>p.name!='(nobody)').sort((a,b)=>{if (a.name>b.name)return 1; if (b.name>a.name)return -1; return 0 })" :key="p">
            <button @click="$store.dispatch('removePerson', p)" style="position:absolute; top:0px; right:0px">X</button>
            <input :value="p.name" @input="p.name=$event.target.value"><br>
            Committees:<br> 
            <select-box :array="$store.state.committees" :showOne="false" :selected="p.committees" @changed-multi="(newCommittees)=>{$store.dispatch('setPersonsCommittees', {person: p, committeeNames:newCommittees.map(c=>c.name)})}" />           
            <!--select multiple @change="$store.dispatch('setPersonsCommittees', {person:p, committeeNames:$event.target.selectedOptions.map(o=>o.value)})">                
                <option selected disabled hidden style='display: none' value=''></option>
                <option :selected="false" v-for="c in $store.state.committees" :key="c" :value="c.name">{{c.name}}</option>
            </select-->
            <button class="clear" @click="$store.dispatch('setPersonsCommittees', {person:p, committeeNames: []})">clear</button>
        </div>
        </div>
    </div>
    <div>        
        <h1>Committees</h1><div class="button" @click="$store.dispatch('addCommittee')">+</div><br>
        <div class="scrollingContainer" style="overflow:scroll; position: relative; max-width:95vw; display:grid; grid-template-columns: repeat(50, 300px); overscroll-behavior: auto;">
        <div class="person" v-for="c in $store.state.committees.sort((a,b)=>{if (a.name>b.name)return 1; if (b.name>a.name)return -1; return 0 })" :key="c">
            <button @click="$store.dispatch('removeCommittee', c)" style="position:absolute; top:0px; right:0px">X</button>
            <input :value="c.name" @input="c.name=$event.target.value"><br>
            <select-box :array="$store.state.people" :showOne="false" :selected="c.members" @changed-multi="(newMembers)=>{$store.dispatch('setCommitteesPeople', {committee:c, PeoplesNames: newMembers.map(p=>p.name)})}" />
            <!--select disabled multiple>                
                <option selected disabled hidden style='display: none' value=''></option>
                <option v-for="p in c.members" :key="p" :value="c.name">{{p.name}}</option>
            </select-->
            <button class="clear" @click="$store.dispatch('clearCommitteesPeople', {committee:c})">clear</button>
        </div>        
        </div>                   
    </div>
</div>
</template>
<script>
import selectBox from './selectBox'
export default {
    name: 'manage-people', components:{selectBox}
}
</script>
<style scoped lang="scss">
div{
    margin:1vw;
    //color:white;
}
div.button{
    width:25px;
    height:25px;
    color:white;
    padding-top:0px;        
    text-align:center;
    margin:6px;
    display:inline-block;
    font-size: 30px;
    //padding:20px;
    border:white 1px solid;
    border-radius: 10px;
    line-height: 30px;
}
h1{
    color:white; 
    display:inline-block;
}
textarea{
    width:100%;
}
.person{
    //display:inline-block;
    border:purple 1px solid;       
    filter: drop-shadow(5px 5px 2px #4444dd);
    padding:0px;
    margin:6px;
    background-color:lavender;
    height:fit-content; //110px;    
    input{
        text-align:center;
        border:1px solid white;
        font-size: 20px;
    }
}
select{
    width:100%; 
    background: transparent;
    outline:none;
}
select:-internal-list-box{
    border-style: none;
}

select::-webkit-scrollbar{
    display:none;
}
option{
    color:darkgrey;
}
.clear{
    width:100%;
    background-color:slateblue;
    color:white
}
.scrollingContainer::-webkit-scrollbar{
    display:none;
}
</style>