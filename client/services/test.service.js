import axios from "axios";
const API_URL = "https://fta-project.vercel.app/";

class TestService{
  publish(title,genre,description,one,two,three,four,five,six,seven,eight,deadline,bonus){
    let token;
    if(localStorage.getItem("user")){
      token = JSON.parse(localStorage.getItem("user")).token;
    }else{
      token = "";
    }
    return axios.post(API_URL+"PredictionTests/newTest",{title,genre,description,one,two,three,four,five,six,seven,eight,deadline,bonus},{
      headers:{
        Authorization:token,
      }
    });
  }
  predict({one,two,three,four,five,six,seven,eight,usePoint,isFlag},_id){
    let token;
    if(localStorage.getItem("user")){
      token = JSON.parse(localStorage.getItem("user")).token;
    }else{
      token = "";
    }
    
    return axios.post(API_URL+"toPredict/"+_id,{one,two,three,four,five,six,seven,eight,usePoint,isFlag},{
      headers:{
        Authorization:token,
      }
    });
  }
  edit(title,genre,description,one,two,three,four,five,six,seven,eight,_id){
    let token;
    if(localStorage.getItem("user")){
      token = JSON.parse(localStorage.getItem("user")).token;
    }else{
      token = "";
    }
    return axios.patch(API_URL+"PredictionTests/"+_id,{title,genre,description,one,two,three,four,five,six,seven,eight},{
      headers:{
        Authorization:token,
      }
    });
  }
  delete(_id){
    let token;
    if(localStorage.getItem("user")){
      token = JSON.parse(localStorage.getItem("user")).token;
    }else{
      token = "";
    }
    return axios.delete(API_URL+"PredictionTests/"+_id,{
      headers:{
        Authorization:token,
      }
    });
  }
  checkOutTheAnswer({description,one,two,three,four,five,six,seven,eight},_id){
    //對答案功能寫在這裡
    let token;
    if(localStorage.getItem("user")){
      token = JSON.parse(localStorage.getItem("user")).token;
    }else{
      token = "";
    }
    return axios.patch(API_URL+"CheckOutTheAnswer/"+_id,{description,one,two,three,four,five,six,seven,eight},{
      headers:{
        Authorization:token,
      }
    });
  }
}

export default new TestService();