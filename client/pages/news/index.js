import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import { useEffect, useRef ,useState} from "react";

const pageSize = 5;

export async function getServerSideProps(){
  const response = await fetch("http://127.0.0.1:8080/news/");
  const data = await response.json();
  return {
    props:{
      data,
    }
  }
}

export default function News({data}){
  const router = useRouter();
  const {query} = router;

  const [currentPage,setCurrentPage] = useState(0);
  const currentData = data.slice(currentPage*pageSize,currentPage*pageSize+pageSize);

  let isLastPage = false;
  if(currentData.length < 5||data.slice((currentPage+1)*pageSize,(currentPage+1)*pageSize+pageSize).length == 0){
    isLastPage = true;
  }


  const handlePrePage = (e) =>{
    e.preventDefault();
    console.log("這是上一頁按鈕")
    setCurrentPage(currentPage - 1);
  }

  const handleNextPage = (e) =>{
    e.preventDefault();
    console.log("這是下一頁按鈕")
    setCurrentPage(currentPage + 1);
  }

  console.log(data)
  return (
    <Layout>
      {data&&
      currentData.map(data=>{
        return (
          <div key={`${data._id}`} className="news">
            <Link href={`/news/${data._id}`}>{data.title}</Link>
            <p><small>{new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}</small></p>
            
          </div>
        )
      })}
      <div className="pagingBtn">
        {currentPage != 0? (<button onClick={handlePrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePrePage} disabled><i className="fa-solid fa-angles-left"></i></button>)}
        {isLastPage ? (<button onClick={handleNextPage} disabled><i className="fa-solid fa-angles-right"></i></button>):(<button onClick={handleNextPage}><i className="fa-solid fa-angles-right"></i></button>)}
      </div>
    </Layout>
  )
}
