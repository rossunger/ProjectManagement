<template>
<div class="div" v-if="$store.state.authenticated == false">
    <img src="DCFacebookHeaderWhiteOnTransparentSmaller.png" class="letterhead">        
    <br>
    <h1 class="h1">Tasks App</h1><br>
    <button class="button" v-if="!$store.state.authenticated" @click="$store.dispatch('login')"><h2>LOGIN</h2></button>    
</div>
<tasks-app v-if="$store.state.authenticated == true" />
</template>
<script>
import TasksApp from "./TasksApp"
export default { 
    name: 'login'   ,
    components:{TasksApp}
}
</script>
<style lang="scss" scoped>
.h1{
    color:white;
    filter:drop-shadow(-2px -1px 0px #4444dd);
    
}
.button{
    border:none;
    background-color: hotpink;
    padding: 16px 60px;
    font-size:20px;
    z-index:10;
    //transform: translateY(-50%) translateX(-50%);
    //position: absolute;
    top:50%; left:50%;
    border-radius:60px;
    color:white;
    filter:drop-shadow(10px 8px 4px #4444dd)     
}
.div{
    color:white;
    position:absolute;
    //transform: translateY(-50%) translateX(-50%);
    width:100vw; height:100vh;
    text-align:center
    //top:50%; left:50%;
}
.letterhead{
    max-width: min(90vw, 50vh);
    min-width: 50vw;
    //position:absolute;
    //transform: translateY(-200%) translateX(-50%);
    //top:50%; left:50%;   
    filter:drop-shadow(10px 8px 4px #4444dd)     
}

</style>