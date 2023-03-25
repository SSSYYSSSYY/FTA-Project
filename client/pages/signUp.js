import Link from "next/link"
import Layout from "@/components/layout"
import AuthService from "@/services/auth.service"
import { useState,useEffect } from "react"
import { useRouter } from "next/router"

export default function SignUp(){
  const router = useRouter();
  //這行一定要寫在這裡?
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [email,setEmail] = useState("");
  const [nickname,setNickname] = useState("");
  const [msg,setMsg] = useState("");
  

  const handleUsername = (e) =>{
    setUsername(e.target.value);
  }
  const handlePassword = (e) =>{
    setPassword(e.target.value);
  }
  const handleEmail = (e) =>{
    setEmail(e.target.value);
  }
  const handleNickname = (e) =>{
    setNickname(e.target.value);
  }
  const handleSignUp = async(e) =>{
    e.preventDefault();
    try{
      await AuthService.signUp(username,password,nickname,email);
      window.alert("登録が成功しました！ログイン画面に遷移します。");
      await new Promise((resolve) => setTimeout(resolve,1000));
      router.push("/login");
    }catch(e){
      setMsg(e.response.data);
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSignUp}>
        {msg && <div className="alertMsg">{msg}</div>}
        <label htmlFor="username">アカウント：</label>
        <input id="username" name="username" type="text"
        onChange={handleUsername} required minLength="5"
        placeholder="五文字以上必要です。"/>
        <br/>
        <label htmlFor="password">パスワード：</label>
        <input id="password" name="password" type="password"
        onChange={handlePassword} required minLength="5"
        placeholder="五文字以上必要です。"/>
        <br/>
        <label htmlFor="email">メールアドレス：</label>
        <input id="email" name="email" type="email"
        onChange={handleEmail} required/>
        <br/>
        <label htmlFor="nickname">ニックネーム：</label>
        <input id="nickname" name="nickname" type="text"
        onChange={handleNickname} required minLength="2"
        placeholder="二文字以上必要です。"/>
        <br/>
        <button type="submit">登録する</button>
      </form>
    </Layout>

  )
}