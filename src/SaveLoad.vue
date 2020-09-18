<template>
<div>
    <button @click="SaveChart('current')">Save chart</button>    
</div>    
</template>
<script>
import PostService from "./PostService.js";
import ARSON from "arson"

export default {
    name:"save-load",    
    data(){
        return{        
            NewChartName:"", NextChart:"", DefaultChart:"", 
            LoadChartSelect:"", DeleteChartSelect:"", NewChartTemplate:""                    
        }
    },  
    computed:{
        ChartList: function(){
            //return this.$store.state.SaveLoad.ChartList
        }
    },
    methods: {        
        /*
        LoadFromClipboard(){            
            navigator.clipboard.readText().then(data => this.$emit('LoadFromData', this.$store.state.SaveLoad.CurrentChart, data));            
        },
        loadFromFile(event) {
            var reader = new FileReader();
            reader.onload = (function(f){
                return function(e){
                    let ChartName = f.substring(f.lastIndexOf('\\')+1, f.indexOf('.json'))                                        
                    this.SaveChart(ChartName, ARSON.parse(e.target.result))
                    this.LoadChart(ChartName)
                }
            })(event.target.value).bind(this)
            reader.readAsText(event.target.files[0]);
        },                       
        async DownloadChart(ChartName) {                                       
            const s = await PostService.getChart(ChartName);        
            if (s[0]) {                    
                const url = window.URL.createObjectURL(new Blob([s[0]]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', ChartName+'.json') //or any other extension
                document.body.appendChild(link)
                link.click()
            }
        },                             
           
        async NewChart(NewChartName, NewChartTemplate) {
            //If it already exists, alert
            if(this.$store.state.SaveLoad.ChartList.includes(NewChartName)){
                if (confirm("A chart with that name already exists! Overwrite?")){                
                    this.SaveChart(NewChartName)    
                    this.$store.commit('setCurrentChart', NewChartName)              
                    document.title = NewChartName                         
                }
            }else{ 
                const x = await PostService.getChart(NewChartTemplate);
                const s = await PostService.updateChart(NewChartName, x);                
                this.$store.dispatch("LoadState", ARSON.parse(x))  
                this.$store.commit('setCurrentChart', NewChartName)              
                document.title = NewChartName                          
            }
        },
        // Returns a list of all the charts that are in the db as an array or string
        async GetChartList(){                       
            const s = await PostService.getChart("");
            //if(s) this.$store.commit('setChartList', s)                         
            //else console.error("no chart list :( ")            
        },   
        */     
        async SaveChart(ChartName, data) {      
            if(!data)data = ARSON.stringify(this.$store.state)                                   
            const s = await PostService.updateChart(ChartName, data);
            if(s.status!=201) console.error(`error ${s.statusText}`)                                                    
        },
        /*
        async RenameChart(OldName,NewName){
            const s = await PostService.renameChart(OldName, NewName);
            //this.$store.state.SaveLoad.CurrentChart = NewName;
            document.title = NewChartName               
        },
        async LoadChart(ChartName, LoadType) {                               
            const s = await PostService.getChart(ChartName);                                    
            if (s[0]) {                  
                switch (LoadType){
                    case 'events':
                        //this.$store.dispatch("LoadEventCollection", {CurrentChart: ChartName, EventCollection: JSON.parse(s[0]).Events.EventCollection })                                          
                        break;
                    case 'all':
                        //this.$store.dispatch("LoadState", ARSON.parse(s[0]))
                        //this.$store.commit('setCurrentChart', ChartName)
                }
                document.title = ChartName                
            }                                                                                               
        },                 
        async DeleteChart(ChartName){
            await PostService.deleteChart(ChartName)        
            let x = await this.GetChartList();                    
            //this.$store.commit('setChartList', x)
        }  
        */                                                                           
    }    
}
</script>
<style scoped>

</style>