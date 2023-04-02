import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import { useEffect, useRef ,useState} from "react";
import ReactMarkdown from "react-markdown";

// export async function getStaticPaths(){
//   const response = await fetch(`https://fta-project.vercel.app/news/`);
//   const data = await response.json();
//   const paths = data.map(d =>{
    
//     return {
//       params:{
//         id:d._id,
//       }
//     }
//   });
//   return {
//     paths,
//     fallback:false,//這樣當使用者隨便輸入一串不存在的_id時才不會引起bug
//   }
// }

// // getStaticPaths()後必須接getStaticProps()才能正常運作
// // 但getStaticProps()本身可以單獨使用

// export async function getStaticProps({params}){
//   const response = await fetch(`https://fta-project.vercel.app/news/${params.id}`);
  
//   const data = await response.json();

//   return {
//     props:{
//       data,
//     },

//   }
// }

export async function getServerSideProps({params}){
  const { id } = params;
  const response = await fetch(`https://fta-project.vercel.app/news/${id}`);
  const data = await response.json();
  return {
    props:{
      data,
    }
  }
}

export default function News({data}){
  //有餘力的話把news部分做成可在網頁上發布新消息的markdown形式
  //需要的套件：react-markdown已安裝 可能還有其他的 到時候再安裝
  return (
    <Layout>
      <div className="newsBody">
        <Link className="goBack" href={`/news`}>戻る</Link>
        <h3>{data.title}</h3>
        <p className="postDate"><small>{new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}</small></p>
        <p className="content">{data.description}</p>
        {/* <ReactMarkdown escapeHtml={false} className="content">{data.description}</ReactMarkdown> */}
        {/* <ReactMarkdown>{markdownTest}</ReactMarkdown> */}
      </div>

    </Layout>
  )
}