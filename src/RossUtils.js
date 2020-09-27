export const DateTime = {    
    formatTime(t){
        if (t > 0 && t < 60) return t + 'sec'
        if (t >= 60){
            let n = Math.trunc(t/60)
            return n + 'min'
        }
    },
    formatDate(date, format){
        switch(format){
            case 'daysFromToday':
                break
            case '':
                break
        }
    },
    compareDates(date1, date2, format){ 
        let d1, d2;    
        if (['days','weeks','months','years'].includes(format)){
            d1 = Date.parse(date1.toString().split('t')[0]) || date1.getTime()
            d2 = Date.parse(date2.toString().split('t')[0]) || date2.getTime()    
        }else{                
            d1 = new Date(date1.getTime())
            d2 = new Date(date2.getTime())
        }      
        if (format=='seconds') format = 1000
        if (format=='minutes') format = 1000*60
        if (format=='hours') format = 1000*60*60
        if (format=='days') format = 1000*60*60*24
        if (format=='weeks') format = 1000*60*60*24*7
        if (format=='months') format = 1000*60*60*24*7*(4 + 1/3)
        if (format=='years') format = 1000*60*60*24*365.25                                             
        return Math.ceil((d1 - d2) / format)//1000 / 60 / 60 / 24)+1
    },
    weeksFromToday(d){
        return this.compareDates(d, new Date(), 'weeks')
    },
    daysFromToday(d){
        return this.compareDates(d, new Date(), 'days')
    },
}

export function searchJSONForItem(obj, id){    
    if(obj.data.id==id)return obj;
    for(let i=0; i<obj.children.length; i++){                    
        if(obj.children[i].data.id == id){               
            return obj.children[i]
        }else{                            
            let x = searchJSONForItem(obj.children[i], id)
            if(x)return x
        }
    }        
    return undefined;        
}
export function searchJSONForParent(obj, id){    
    if(obj.data.id==id)return obj;
    for(let i=0; i<obj.children.length; i++){            
        if(obj.children[i].data.id == id){   
            return obj
        }else{                            
            let x = searchJSONForParent(obj.children[i], id)
            if(x)return x
        }
    }        
    return undefined;        
}
export function getJSONPathAsArray(obj, id){
    if(obj.data.id==id)return [obj];
    
    
    for(let i=0; i<obj.children.length; i++){            
        if(obj.children[i].data.id == id){   
            return [obj, obj.children[i]]
        }else{                            
            let x = getJSONPathAsArray(obj.children[i], id)
            //x.splice(0,0, [obj])
            //console.log([obj, ...x])
            if(x)return [obj, ...x]
        }
    }        
    return undefined;        
}
export function getIndexPathAsArray(obj, id, currentIndex){
    if(obj.data.id==id)return [currentIndex];        
    for(let i=0; i<obj.children.length; i++){            
        if(obj.children[i].data.id == id){   
            return [obj, i]
        }else{                            
            let x = getIndexPathAsArray(obj.children[i], id, i)
            //x.splice(0,0, [obj])
            //console.log([obj, ...x])
            if(x)return [currentIndex, ...x]
        }
    }        
    return undefined;        
}
export function searchJSONandDelete(arr, id){
    for(let i=0; i<arr.length; i++){            
        if(arr[i].data.id == id){                
            return arr.splice(i, 1)
        }else{
            if(searchJSONandDelete(arr[i].children, id))return true
        }
    }    
    return false;        
}

export function autoSave(){            
    //this.autoSaveTimeout = setTimeout(this.autoSave, 5000)            
}