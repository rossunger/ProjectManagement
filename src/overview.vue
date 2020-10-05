<template>
<div style="margin: 2vmax;" class='container'>
    <div style="display:relative">
        <h1 style="display:inline-block">EVENTS</h1><div v-if="editing" class="button" style="margin-left:20px; display:inline-block" @click="$store.dispatch('createEvent')">+</div>
    </div>
    <div class="category">         
        <div v-for="(event, i) in $store.state.events" :key="event" :style="{'grid-row': 1, 'grid-column': (i+1)}" class="scrollingItem">
            <!--button @click="setEventTag(event)">Set Tag</button-->            
            <img class="thumbnail" v-if="event.image" :src="event.image">
            <div @click="linkImage(event)" class="addImage" v-if="!event.image">(add image)</div>
            <input @input="event.name = $event.target.value" :value="event.name"><br>
            <textarea @input="event.description = $event.target.value" :value="event.description"/>
            <div v-if="filterEventTasks(event).length>0" style="margin-bottom:2px;">Upcoming Dates:</div>            
            <div v-for="task in filterEventTasks(event)" :key="task" style="display:inline-grid; grid-template-columns: 30px; 200px; width:50% ">                                
                <div class='eventDates eventdate'>{{task.due.getDate() + '/' + task.due.getMonth()}}</div>
                <div class='eventDates eventname'>{{task.name}}</div>
                

            </div>
            <div @click="openDoc(event.doc)" style="position:absolute; right:5px; bottom:5px; background-color: #FFF3; padding:5px; border-radius:10px;">Links</div>
            <div v-if="editing" @click="setDoc(event)" style="position:absolute; right:65px; bottom:5px; background-color: #FFF3; padding:5px; border-radius:10px;">Set Link</div>
        </div>        
    </div>    

    <div style="display:relative">
        <h1 style="display:inline-block">PROJECTS</h1><div v-if="editing" class="button" style="margin-left:20px; display:inline-block" @click="$store.dispatch('createProject')">+</div>
    </div>
    <div class="category">                
        <div v-for="(project, i) in $store.state.projects" :key="project" :style="{'grid-row': 1, 'grid-column': (i+1)}" class="scrollingItem">
            <img class="thumbnail" v-if="project.image" :src="project.image">
            <div @click="linkImage(project)" class="addImage" v-if="!project.image">(add image)</div>
            <input @input="project.name = $event.target.value" :value="project.name"><br>
            <textarea @input="project.description = $event.target.value" :value="project.description"/>
            <br><br><br>
            <div @click="openDoc(project.doc)" style="position:absolute; right:5px; bottom:5px; background-color: #FFF3; padding:5px; border-radius:10px;">Links</div>
            <div v-if="editing" @click="setDoc(project)" style="position:absolute; right:65px; bottom:5px; background-color: #FFF3; padding:5px; border-radius:10px;">Set Link</div>
        </div>
    </div>  
    <div v-if="$store.state.debug=='debug' || $store.state.currentUser == $store.getters.personByName('Ross')" class="button" style="font-size:6px; line-height:8px; padding-top:4px; margin-left:20px; display:inline-block" @click="editing=!editing">{{editing ? "Done Editing" : "Edit Links"}}</div>  
</div>
</template>
<script>
import selectBox from './selectBox'
export default {
    name: 'overview', components:{selectBox},    
    methods:{
        linkImage(parent){
            let link = prompt('Please paste a link to the image')
            if(link){
                console.log('linking to: ' + link)
                parent.image = link
                //this.$store.dispatch('addImage')
            }                            
        },
        filterEventTasks(event){            
            let ret = this.$store.getters.tasksByTag('event')            
            ret = this.$store.getters.tasksByTag(event.tag, ret)                                    
            return ret
        },
        setEventTag(event){
            let tag = prompt('choose a tag for ' + event.name)
            if (tag){
                event.tag = tag
            }
        },
        openDoc(url){
            window.open(url, '_blank');
        },
        setDoc(event){
            let doc = prompt('choose a link for ' + event.name)
            if (doc){
                event.doc = doc
            }            
        }
    },
    computed:{
        allTasks: function(){ return this.$store.getters.allTasks }        
    },
    data(){
        return{
            editing:false
        }
    }
}
</script>
<style scoped lang="scss">
div{
    color:white;
    margin-right:5px;
}
h1{
    max-width: 90vw;
}
input{
    color:white;
    font-size:20px;
}
textarea{
    width:250px;
    max-width: 95vw;
    height: 60px;
    border:none;
    resize: none;
    border-radius: 10px;
    padding:6px;
    font-family: "Comfortaa", sans-serif;
}
.category{
    //min-width: 95vw;
    max-width:95vw;    
    scroll-snap-type: x mandatory;    
    display: grid;
    overflow-y: scroll;      
    //height: 10px;
}
.category::-webkit-scrollbar{
    display:none;
}
.scrollingItem{
    scroll-snap-align: start;    
    background-color: #FFF3;
    filter: drop-shadow( 2px 2px #333);
    padding:8px;
    border-radius:10px;
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
.container{
    margin-top: 10px;
}
.addImage{
    //width:20px;
    //height:100%;
    font-size:6px;
    margin-right:5px;
    padding: 5px;
}
.eventDates{
    font-size:10px;
    width: fit-content;
    margin-right:0px;
    display:inline-block;
}
.eventdate{
    grid-column: 1;    
}
.eventname{
    grid-column: 2;
}
.thumbnail{
    max-width: min(60%, 90vw);
    object-fit: contain;
}
</style>