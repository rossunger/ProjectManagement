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
@use "./CSS/consts.scss" as *;
#app{
    //background-color:var(--back);
    width:100%;
    height:100%;    
    z-index:-10;
    //position:fixed;
    //text-align: center;    
    
}
body{
    margin:0px;
    
}
</style>