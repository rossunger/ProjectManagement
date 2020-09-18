<template>  
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
        <div v-for="e in $store.getters.getTasksOnDate(month(d), days(d))" :key="e">{{e.name}}</div>

    </div>
    
</div>
</template>

<script>
export default {    
    name: "calendar",
    data(){
        return{
            dragging:"", menu: false
        }
    },
    computed: {
        tasks: function(){     
            let ret = this.$store.getters.tasksByDate    
            return ret        
        },        
        months: function(){
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sep','Oct', 'Nov', 'Dec']
        }
    },    
    methods:{                             
        days(d){            
            if (d >31) {d-=31            
            if (d>29) {d-=29
            if (d >31) {d-=31
            if (d >30) {d-=30
            if (d >31) {d-=31
            if (d >30) {d-=30
            if (d >31) {d-=31
            if (d >31) {d-=31
            if (d >30) {d-=30
            if (d >31) {d-=31
            if (d >30) {d-=30
            if (d >31) d-=31
            }}}}}}}}}}}        
            return d            
        },
        month(d){
            let m
            if (d<32) m=0
            if (d<61) m=1
            if (d<92)  m=2
            if (d<122) m=3
            if (d<153) m=4
            if (d<183) m=5
            if (d<214) m=6
            if (d<245) m=7
            if (d<275) m=8
            if (d<306) m=9
            if (d<336) m=10
            if (d<367) m=11
            return m
        },
        monthStart(d, text){
            let m=""
            if (d==1) text ? m= "Jan" : m=0
            if (d==32)  text ? m= "Feb" : m=1
            if (d==61)  text ? m= "Mar" : m=2
            if (d==92) text ? m= "Apr" : m=3
            if (d==122) text ? m= "May" : m=4
            if (d==153) text ? m= "Jun" : m=5
            if (d==183) text ? m= "Jul" : m=6
            if (d==214) text ? m= "Aug" : m=7
            if (d==245) text ? m= "Sep" : m=8
            if (d==275) text ? m= "Oct" : m=9
            if (d==306) text ? m= "Nov" : m=10
            if (d==336) text ? m= "Dec" : m=11
            return m
        },
        dayOfTheYear(date){            
            let m= date.getMonth()
            let d= date.getDay()
            if (m >0) d+=31
            if (m >1) d+=29
            if (m >2) d+=31
            if (m >3) d+=30
            if (m >4) d+=31
            if (m >5) d+=30
            if (m >6) d+=31
            if (m >7) d+=31
            if (m >8) d+=30
            if (m >9) d+=31
            if (m >10) d+=30
            if (m >11) d+=31            
            return d            
        },
        dayOfTheWeek(d){
            if (d % 7 == 0) return "Tue"
            if (d % 7 == 1) return "Wed"
            if (d % 7 == 2) return "Thu"
            if (d % 7 == 3) return "Fri"
            if (d % 7 == 4) return "Sat"
            if (d % 7 == 5) return "Sun"
            if (d % 7 == 6) return "Mon"            
        },
        goToToday(){
            let m =             
            this.$refs['M'+new Date().getMonth()].scrollIntoView()
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
	padding: 15px;
	position: relative;
    font-size: 20px;
    grid-column: span 1;
    width: 14.28571vw;
    height: 20vh;
}

.month {	
	font: 900 10vh "Montserrat", sans-serif;
	text-transform: uppercase;	
	text-align: center;
	color: rgba(255, 255, 255, 0.2);
	text-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);	
    grid-column: span 7;
    grid-row: span 5;
    position: absolute;
    bottom:0px;
    width:100%;
}

.main-content {
	display: grid;
	grid-auto-flow: row;
	//grid-template-rows: repeat(1000, 170px) 80px;
	//grid-template-columns: repeat(7, minmax(170px, 1fr));
}
.event {
	z-index: 10;
	background: transparent;
	padding-top: 40px;
	&__name {
		background: rgba(255, 255, 255, 0.4);
		border-radius: 20px;
		height: auto;
		padding: 10px;
		margin: 10px;
		font-size: 14px;
	}	
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
</style>