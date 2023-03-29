import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import { useState,useEffect } from "react"
import AuthService from "@/services/auth.service";
import axios from "axios";

export default function Contact(){
  const router = useRouter();
  const [currentUser,setCurrentUser] = useState(null);
  const [formData,setFormData] = useState("");

  useEffect(()=>{
    setCurrentUser(AuthService.getCurrentUser());
  },[]);

  if(!currentUser){
    return (
      <Layout>
        <h2 className="pleaseLogin">ログインしてください。</h2>
      </Layout>
    )
  }

  const handleFormData = (e) =>{
    setFormData(e.target.value);
  }
  // console.log(currentUser.user)
  const handleSubmit = async(e) =>{
    e.preventDefault();
    try{
    let nickname = currentUser.user.nickname;
    let email = currentUser.user.email;
    let contactObj = {
      nickname,email,formData
    }
    const response = await axios.post("http://127.0.0.1:8080/contact",contactObj);
    window.alert(response.data);
    router.push("/");
    
    }catch(e){
      console.log(e);
    }
  }

  //server端使用nodemailer套件
  return (
    <Layout>
      <h2>お問い合わせ</h2>
      <form onSubmit={handleSubmit} action="/contact" method="POST">
        <label htmlFor="nickname">ニックネーム：</label>
        <input name="nickname" value={currentUser.user.nickname} id="nickname" readOnly/>
        <br/>
        <label htmlFor="email">メールアドレス：</label>
        <input name="email" value={currentUser.user.email} id="email" readOnly/>
        <br/>
        <label htmlFor="context">お問い合わせ内容：</label>
        <br/>
        <textarea onChange={handleFormData} cols="40" rows="10" id="context"
        placeholder="不具合や要望などをご記入ください。" required></textarea>
        <br/>
        <button type="submit">送信</button>
      </form>
    </Layout>
  )
}