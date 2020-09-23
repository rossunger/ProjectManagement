<template>    
    <div class="background" @scroll.prevent="">          
    </div>
    <router-view></router-view>                
</template>

<script>
export default {    
    name: "app",
    
}

</script>
<style lang="scss">
#app{
    background-color:slateblue;
    width:100%;
    height:100%;    
    //position:fixed;
    //text-align: center;    
    
}
body{
    margin:0px;
    
}
</style>