import Link from "next/link"
import Layout from "@/components/layout"
import AuthService from "@/services/auth.service"
import { useState,useEffect } from "react"
import { useRouter } from "next/router"

export default function Login(){
  const router = useRouter();
  //這行一定要寫在這裡?
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  const handleUsername = (e) =>{
    setUsername(e.target.value);
  }
  const handlePassword = (e) =>{
    setPassword(e.target.value);
  }
  const handleLogin = async(e) =>{
    e.preventDefault();
    try{
      let response = await AuthService.login(username,password);
      localStorage.setItem("user",JSON.stringify(response.data));
      window.alert("ログイン成功しました！プロフィール画面に遷移します。");
      await new Promise((resolve) => setTimeout(resolve,1000));
      router.push(`/profile/${response.data.user._id}`);
    }catch(e){
      setMsg(e.response.data);
    }
    
    
  }
  return (
    <Layout>
      {msg && <div className="alertMsg">{msg}</div>}
      <form className="login" onSubmit={handleLogin}>
        <div className="username">
          <label htmlFor="username">アカウント：</label>
          <input id="username" name="username" type="text"
          onChange={handleUsername} required/>
        </div>

        <div className="password">
          <label htmlFor="password">パスワード：</label>
          <input id="password" name="password" type="password"
          onChange={handlePassword} required/>
        </div>


        <button type="submit">ログイン</button>
      </form>
    </Layout>

  )
}