import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";
import TestsPageTemplate from "@/components/TestsPageTemplate";
import { useEffect, useRef ,useState} from "react";


const pageSize = 5;

export async function getServerSideProps(){
  const response = await fetch("http://127.0.0.1:8080/PredictionTests/");
  const data = await response.json();
  return {
    props:{
      data,
    }
  }
}

export default function TestHome({data}){
  const router = useRouter();

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

  // const page = query.page ? parseInt(query.page,10):1;
  // const start = (page-1)*PAGE_SIZE;
  // const end = start+PAGE_SIZE;
  // const totalPages= Math.ceil(data.length/PAGE_SIZE);
  //這裡的data要記得用{}包住
  return <Layout>
    <div>
      
      <TestsPageTemplate>
      <div>
        {data && 
          currentData.map(data =>{
            return (
              <div key={data._id} className="PredictionTests">
              <Link href={`/PredictionTests/${data._id}`}><h2>{`問${data.test_ID}：${data.title}`}</h2></Link>
              <p>ジャンル：{data.genre}</p>
              <p>{`基礎ポイント：${data.bonus}`}</p>
              <small>出題者：<Link href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
            </div>

            )
          })
          }
      </div>
      <div className="pagingBtn">
          {currentPage != 0? (<button onClick={handlePrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePrePage} disabled><i className="fa-solid fa-angles-left"></i></button>)}
          {isLastPage ? (<button onClick={handleNextPage} disabled><i className="fa-solid fa-angles-right"></i></button>):(<button onClick={handleNextPage}><i className="fa-solid fa-angles-right"></i></button>)}
      </div>
      </TestsPageTemplate>
    </div>
  </Layout>
}

