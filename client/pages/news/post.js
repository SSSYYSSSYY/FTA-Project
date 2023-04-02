import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import { useEffect, useRef ,useState} from "react";
import axios from "axios";
import { ApiError } from "next/dist/server/api-utils";
const API_URL = "http://127.0.0.1:8080/";

export default function PostNews(){
  const router = useRouter();
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");

  const handleTitle = (e) =>{
    setTitle(e.target.value)
  }
  const handleDes = (e) =>{
    setDescription(e.target.value)
  }

  const handleSubmit = (e) =>{
    e.preventDefault();
    console.log(title,description)
    axios.post(API_URL+"news",{title,description})
    .then(()=>{
      window.alert("お知らせの作成に成功しました。");
      router.push("/news");
    }).catch(e=>console.log(e));
  }

  // console.log(title)
  // console.log(description)

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="newsForm">
        <label htmlFor="news-title">タイトル：</label>
        <textarea rows={2} id="news-title" name="title" required
          onChange={handleTitle}></textarea>

        <label htmlFor="news-description">説明：</label>
        <textarea wrap="physical" rows={8} id="news-description" name="description"
        onChange={handleDes} required placeholder="説明をここにご記入ください。" cols={36}></textarea>
        <button type="submit">送信する</button>
      </form>
    </Layout>
  )
}