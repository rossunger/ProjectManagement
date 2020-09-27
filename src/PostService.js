import axios from "axios";

//const url= "http://localhost:5000/api/dc/";

//export const baseurl = "http://chartsbackend.herokuapp.com/"
export const baseurl = "https://dcproject-management-backend.nn.r.appspot.com/"
const url = baseurl + "api/dc/";
//const url = "http://localhost:5000/api/dc/"; //"http://chartsbackend.herokuapp.com/api/dc/"

class PostService {
  static async getChart(ChartName) {    
    const res = await axios.get(`${url}${ChartName}`)      
    let data =[];
    /** if not looking for a specific chart, return an array of chart names as a string */
    if(ChartName===""){
      for(let i=0; i<res.data.length; i++){
        // If what kinda chart are we getting?        
        data.push((res.data[i].ChartName));                
      }
    }
    else{                 
        data[0] = res.data[0].data.text;       
    }
    //console.log(data);
    return(data);        
  }    
  /** Returns a ??? */
  static async updateChart(ChartName, text) {
    return axios.put(`${url}${ChartName}`, {text});    
    
  }
  static async deleteChart(ChartName) {
    return axios.delete(`${url}${ChartName}`);
  }
  static async renameChart(OldName, NewName){
    return axios.put(`${url}rename/${OldName}/${NewName}`);
  }
}
export default PostService;
