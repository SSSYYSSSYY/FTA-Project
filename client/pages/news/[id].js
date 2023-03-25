import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import { useEffect, useRef ,useState} from "react";

export async function getStaticPaths(){
  const response = await fetch(`http://127.0.0.1:8080/news/`);
  const data = await response.json();
  const paths = data.map(d =>{
    
    return {
      params:{
        id:d._id,
      }
    }
  });
  return {
    paths,
    fallback:false,//這樣當使用者隨便輸入一串不存在的_id時才不會引起bug
  }
}

// getStaticPaths()後必須接getStaticProps()才能正常運作
// 但getStaticProps()本身可以單獨使用

export async function getStaticProps({params}){
  const response = await fetch(`http://127.0.0.1:8080/news/${params.id}`);
  
  const data = await response.json();
  return {
    props:{
      data,
    },

  }
}

export default function News({data}){
  console.log(data)
  return (
    <Layout>
      <h3>{data.title}</h3>
      <p><small>{data.postDate}</small></p>
      <p>{data.description}</p>

      <Link href={`/news`}>戻る</Link>
    </Layout>
  )
}