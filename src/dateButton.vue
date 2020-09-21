<template>
<label class="dateButton">
    <input @contextmenu.prevent="set(task, 'due', null); $event.target.value=null; " type="date" class="dateButton" @change="set(task, 'due', new Date($event.target.value))">
    
<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48">    
    <svg y="3">
        <path :stroke="urgencyColor" :stroke-width="urgencyWidth" fill="#FFFFFF" d="M5,38V14h38v24c0,2.2-1.8,4-4,4H9C6.8,42,5,40.2,5,38z"/>
        <path fill="#F44336" d="M43,10v6H5v-6c0-2.2,1.8-4,4-4h30C41.2,6,43,7.8,43,10z"/>
        <g fill="#B71C1C">
            <circle cx="33" cy="10" r="3"/>
            <circle cx="15" cy="10" r="3"/>
        </g>
        <g fill="#B0BEC5">
            <path d="M33,3c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2s2-0.9,2-2V5C35,3.9,34.1,3,33,3z"/>
            <path d="M15,3c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2s2-0.9,2-2V5C17,3.9,16.1,3,15,3z"/>
        </g>
        <g fill="#DDDDDD">
            <rect x="13" y="20" width="4" height="4"/>
            <rect x="19" y="20" width="4" height="4"/>
            <rect x="25" y="20" width="4" height="4"/>
            <rect x="31" y="20" width="4" height="4"/>
            <rect x="13" y="26" width="4" height="4"/>
            <rect x="19" y="26" width="4" height="4"/>
            <rect x="25" y="26" width="4" height="4"/>
            <rect x="31" y="26" width="4" height="4"/>
            <rect x="13" y="32" width="4" height="4"/>
            <rect x="19" y="32" width="4" height="4"/>
            <rect x="25" y="32" width="4" height="4"/>
            <rect x="31" y="32" width="4" height="4"/>
        </g>   
    </svg> 
    <text text-anchor="middle" x="23" y="41" font-size="25">{{daysFromToday}}</text>
</svg>
    
</label>   
</template>
<script>
import {DateTime} from "./RossUtils"
export default {
    name:'date-button',
    props: { task: Object },
    computed: {
        daysFromToday: function(){
            if (this.task.due)
                return DateTime.daysFromToday(this.task.due)
        },
        urgencyWidth: function(){            
            if (this.task.due && this.daysFromToday < 1)
                return Math.max(2, Math.min(Math.abs(this.daysFromToday), 5))            
            if (this.task.due && this.daysFromToday >= 0 && this.daysFromToday <= 3 )
                return 4-this.daysFromToday
            return 0
        },
        urgencyColor: function(){
            if (this.task.due && this.daysFromToday < 1)
                return "red"
            if (this.task.due && this.daysFromToday > 0 && this.daysFromToday < 4)
                return "orange"
            return ""
        }
    },
    methods:{
        set(obj, prop, value){
          obj[prop] = value
          this.$store.dispatch('addUndo')
        }
    }
}
</script>
<style scoped>
label.dateButton {
    display: inline-block;  
    position: relative;
    line-height: 0;    
}
input.dateButton {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    border: 0;
    overflow: hidden;
}
input.dateButton::-webkit-calendar-picker-indicator {
    position: absolute;
    top: -150%;
    left: -150%;
    width: 300%;
    height: 300%;
    cursor: pointer;
}
svg{
    width:20px; 
    height:20px;
    margin-right:2px;
}
</style>