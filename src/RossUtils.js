
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