import Link from "next/link"
import Layout from "@/components/layout"
import TestsPageTemplate from "@/components/TestsPageTemplate";
import { useRouter } from "next/router";
import { useEffect, useRef ,useState} from "react";

const pageSize = 5;

export async function getServerSideProps(context){
  const {id} = context.params;
  const data = await fetch(`http://127.0.0.1:8080/PredictionTests/genre/${id}`);
  const tests = await data.json();

  return {
    props:{
      tests,
    }
  }
}

export default function Tests({tests}){
  const router = useRouter();

  const [currentPage,setCurrentPage] = useState(0);
  const currentData = tests.slice(currentPage*pageSize,currentPage*pageSize+pageSize);

  let isLastPage = false;
  if(currentData.length < 5||tests.slice((currentPage+1)*pageSize,(currentPage+1)*pageSize+pageSize).length == 0){
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


  return (
    <Layout>
      <TestsPageTemplate>
        <div>
        {tests && 
          currentData.map(data =>{
            return (
              <div key={data._id} className="PredictionTests">
                <Link href={`/PredictionTests/${data._id}`}><h2>{`問${data.test_ID}：${data.title}`}</h2></Link>
                <p>ジャンル：{data.genre}</p>
                <p>{`基礎ポイント：${data.bonus}`}</p>
                <small>出題者：<Link href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
              </div>
            )
          })}
        </div>
        <div className="pagingBtn">
          {currentPage != 0? (<button onClick={handlePrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePrePage} disabled><i className="fa-solid fa-angles-left"></i></button>)}
          {isLastPage ? (<button onClick={handleNextPage} disabled><i className="fa-solid fa-angles-right"></i></button>):(<button onClick={handleNextPage}><i className="fa-solid fa-angles-right"></i></button>)}
        </div>
      </TestsPageTemplate>
    </Layout>
  )
}