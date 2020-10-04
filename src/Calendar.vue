<template>  
<div class="main-content">       
    <div :style="{color: '#5598','line-height':'30px','text-align': 'center', 'z-index':20,left: i*(100/7)+'vw', top: '0px', position:'fixed', width:100/7+'vw', height:'30px', 'background':'tranparent', outline: '1px grey '}"  v-for="(theday, i) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="theday">        
        {{theday}}
    </div>
    <div @click="reordering=0" class="date"  v-for="d in 356" :key="d" @dblclick.self="createTaskOnDay(d)" >            
        <div class="back" :style="calculateStyle(d)"> </div>
        <div class="moveHere" v-if="reordering && !($store.getters.taskById(reordering).due.toDateString() == new Date(calendarStart + ((d-1)*24*60*60*1000)).toDateString())" @click="$store.getters.taskById(reordering).due = new Date(calendarStart+((d-1) * 1000*60*60*24)); reordering=0;">Move here</div>                
        {{dayOfTheMonth(d)}}
        <div class="month" v-if="dayOfTheMonth(d)==1">{{monthOfTheYear(d)}}</div>
        <div class="events" @dblclick.stop.self="createTaskOnDay(d)">
            <div v-if="$store.getters.getTasksOnDate(new Date(calendarStart+((d-1) * 1000*60*60*24))).length > 4" 
                style="position:absolute; left:50%; bottom: -3px; font-size:2vmin">
                <i class="fas fa-sort-down"></i>
            </div>
            <div class="event" :style="{top: (i-1)*15 + '%', 'background-color': e.tags.has('event') ? eventColor : e.tags.has('meeting') ? meetingColor: ''}" v-for="(e, i) in $store.getters.filterTasks(undefined, $store.getters.getTasksOnDate(new Date(calendarStart+((d-1) * 1000*60*60*24))))" :key="e">
                <div style="position:relative;">
                    <input @contextmenu.prevent="editTask(e.id)" :value="e.name" @input="e.name=$event.target.value" style="text-align:center; font-size:1vw; width:100%">
                    <button v-if="reordering == e.id" @click="$store.dispatch('deleteTaskById', reordering); reordering=false;" style="position:absolute; right:1px; top:1px; font-size:9px; border:none; padding: 2px 5px; border-radius:50%">x</button>                    
                    <!--div @click="reordering=e.id" v-if="reordering == 0" style="position:absolute; right:4px; top: 33%;"><i class="fas fa-arrows-alt"></i></div-->
                </div>
                
            </div>
        </div>
    </div>
</div>
<!--
<button @click="$refs['M'+new Date().getMonth()].parentElement.scrollIntoView()" style="position: fixed; left:5px; top:30px; z-index: 20">Today</button>
<div class="main-content">    
    <div class="date" :style="{gridColumn: ((d+1) % 7) +1, gridRow: Math.ceil((d+2) / 7), background: '#db7f7a' ,filter: 'hue-rotate('+d+'deg)'}" v-for="d in 356" :key="d">
        {{days(d)}}
        <div class="day">
            {{dayOfTheWeek(d) }}
        </div>
        <div v-if="days(d)==1" class="month" :ref="'M'+ monthStart(d, false)">            
            {{monthStart(d, true)}}
        </div>                

    </div>
    
</div>
-->
</template>

<script>
import DateTime from "./RossUtils.js"
export default {    
    name: "calendar",
    data(){
        return{
            dragging:"", menu: false, reordering: false, eventColor: '#DD3', meetingColor: '#7DF'
        }
    },
    computed: {
        tasks: function(){     
            let ret = this.$store.getters.tasksByDate                        
            return ret        
        },        
        months: function(){
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sep','Oct', 'Nov', 'Dec']
        },
        calendarStart: function(){
            let today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12)
            return today.getTime() - (new Date().getDay() *24*60*60*1000)
        }
    },    
    methods:{        
        calculateStyle(d){
            let ret = "background: #db7f7a; filter: hue-rotate("+d+"deg) ";            
            return ret
        },
        monthOfTheYear(d){
            let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            return months[new Date(this.calendarStart + (d * 1000*60*60*24) ).getMonth()]
        },
        dayOfTheMonth(d){
            let da = new Date(this.calendarStart + (d * 1000*60*60*24) )            
            return da.getDate() 
        },
        dayOfTheWeek(d){
            let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            return days[new Date(this.calendarStart + (d * 1000*60*60*24) ).getDay()]
        },
        createTaskOnDay(d){
            let due = new Date(this.calendarStart+ ((d-1)*1000*60*60*24))          
            this.$store.dispatch('createTask', {due, tags: ['event']})
        },
        editTask(id){
            this.reordering=id;
        }
    },
}

</script>
<style lang="scss">

* {
	box-sizing: border-box;
}
body {
	font-family: "Comfortaa", sans-serif;
}
.date {	
	//padding: 15px;
	position: relative;
    font-size: 2vw; //20px;
    //grid-column: span 1;
    //display:inline-block;    
    width: 14.28571vw;
    height: 10vw;
 
}
.date .back{    
    width:100%;
    height:100%;    
    position:absolute;
    border: 1px solid #CA7676;
    z-index: -1;
}

.month {	
	font: 900 5vmin "Montserrat", sans-serif;
	text-transform: uppercase;	
	//text-align: center;
	color: rgba(255, 255, 255, 0.2);
	text-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);	    
    position: absolute;
    bottom:0px;
    width:100%;
    isolation:isolate;
    z-index:100;
}

.main-content {
    display: flex; //grid;    
    flex-wrap: wrap;
    grid-auto-flow: row;    
	//grid-template-rows: repeat(1000, 170px) 80px;
	//grid-template-columns: repeat(7, minmax(170px, 1fr));
}
.event {
	z-index: 10;	
	background: rgba(255, 255, 255, 0.4);
	border-radius: 20px;
    height: fit-content;
    max-height:30%;
    text-align: center;
    width:80%;
    //position:absolute;
    padding: 1%;    
	margin-left: 10%;
    margin-bottom: 1%;
	font-size: 0.5vmin;		    
}
.date .day{	
		position: absolute;
		z-index: 20;
		top: 15px;
		right: 15px;
		font-size: 10px;
		text-transform: uppercase;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);	
}  
.events::-webkit-scrollbar { 
    display: none;
}
.events{
    //-ms-overflow-style: none;  /* Internet Explorer 10+ */
    //scrollbar-width: none;  /* Firefox */
    overflow-y:scroll; 
    height:75%;
    
}
.moveHere{
    width:100%;
    height:100%;
    background-color:#3335;
    border:1px solid black;
    color:white;
    &:hover{
        background-color:#0000;
    }
    text-align:center;
    padding: 18%;
    z-index:20;
    position:absolute
}

</style>