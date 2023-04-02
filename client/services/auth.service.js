import axios from "axios";
const API_URL = "https://fta-project.vercel.app/";

class AuthService{
  login(username,password){
    return axios.post(API_URL+"login",{
      username,
      password,
    })
  }
  logout(){
    localStorage.removeItem("user");
  }
  signUp(username,password,nickname,email){
    return axios.post(API_URL+"signUp",{
      username,
      password,
      nickname,
      email,
    })
  }

  getCurrentUser(){
    //今ログインしているユーザーの情報を取得する
    return JSON.parse(localStorage.getItem("user"));
  }

}

export default new AuthService();