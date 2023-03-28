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

//因為這裡是進來題目頁面之後一口氣加載完所有題目，才能實現翻頁時不換頁
//未來等題目變多之後應該就會卡頓，之後可能需要修改邏輯

export default function TestHome({data}){
  const router = useRouter();

  const [currentSelect,setCurrentSelect] = useState("")
  const [selectedData,setSelectedData] = useState(data);
  const handleByGenre = (e) =>{
    fetch(`http://127.0.0.1:8080/PredictionTests/genre/${e.target.textContent}`)
    .then(data=>data.json())
    .then(data=>setSelectedData(data))
    .catch(e=>console.log(e));
    setCurrentSelect(e.target.textContent);
  }

  const handleAllTests = (e) =>{
    fetch(`http://127.0.0.1:8080/PredictionTests`)
    .then(data=>data.json())
    .then(data=>setSelectedData(data))
    .catch(e=>console.log(e));
    setCurrentSelect("");
  }

  const handleAccepting = (e) =>{
    fetch(`http://127.0.0.1:8080/PredictionTests/status/isAccepting`)
    .then(data=>data.json())
    .then(data=>setSelectedData(data))
    .catch(e=>console.log(e));
    setCurrentSelect("回答受付中");
  }
  const handleWaiting = (e) =>{
    fetch(`http://127.0.0.1:8080/PredictionTests/status/isWaitingForAnswering`)
    .then(data=>data.json())
    .then(data=>setSelectedData(data))
    .catch(e=>console.log(e));
    setCurrentSelect("答え合わせ待ち");
  }
  const handleAnswered = (e) =>{
    fetch(`http://127.0.0.1:8080/PredictionTests/status/isAnswered`)
    .then(data=>data.json())
    .then(data=>setSelectedData(data))
    .catch(e=>console.log(e));
    setCurrentSelect("答え合わせ済み");
  }

  console.log(currentSelect)


  const [currentPage,setCurrentPage] = useState(0);
  // const currentData = data.slice(currentPage*pageSize,currentPage*pageSize+pageSize);

  const currentData = selectedData.slice(currentPage*pageSize,currentPage*pageSize+pageSize);

  let isLastPage = false;
  if(currentData.length < 5||selectedData.slice((currentPage+1)*pageSize,(currentPage+1)*pageSize+pageSize).length == 0){
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

        
        <input id="selectTestsNav" type="checkbox"/>
        <label htmlFor="selectTestsNav" className="selectTestsNav">ジャンルで絞る&nbsp;&nbsp;&nbsp;</label>
        <ul className="testsByGenre">
          <li onClick={handleByGenre}>グルメ</li>
          <li onClick={handleByGenre}>芸能</li>
          <li onClick={handleByGenre}>時事・トレンド</li>
          <li onClick={handleByGenre}>スポーツ</li>
          <li onClick={handleByGenre}>アニメ・ゲーム</li>
          <li onClick={handleByGenre}>政治経済</li>
          <li onClick={handleByGenre}>趣味・雑学</li>
          <li onClick={handleByGenre}>ノンジャンル</li>
        </ul>

        <ul className="testsByStatus">
          {currentSelect == "回答受付中"?(<li className="selected" onClick={handleAccepting}>&nbsp;回答受付中&nbsp;</li>):(<li onClick={handleAccepting}>回答受付中</li>)}
          {currentSelect == "答え合わせ待ち"?(<li className="selected" onClick={handleWaiting}>答え合わせ待ち</li>):(<li onClick={handleWaiting}>答え合わせ待ち</li>)}
          {currentSelect == "答え合わせ済み"?(<li className="selected" onClick={handleAnswered}>答え合わせ済み</li>):(<li onClick={handleAnswered}>答え合わせ済み</li>)}
        </ul>
        
      <div className="currentTests">
        {data && 
          currentData.map(data =>{
            return (
              <div key={data._id} className="PredictionTests">
              <Link target="_blank" href={`/PredictionTests/${data._id}`}><h4>{`問${data.test_ID}：${data.title}`}</h4></Link>
              <p className="genre">{`ジャンル：${data.genre}`}</p>
              <p className="basicPoint">{`基礎ポイント：${data.bonus}`}</p>
              <small className="publisher">出題者：<Link target="_blank" href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
            </div>

            )
          })
          }
      </div>
      <div className="pagingBtn">
          {currentPage != 0? (<button onClick={handlePrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePrePage} disabled><i className="fa-solid fa-angles-left"></i></button>)}
          {isLastPage ? (<button onClick={handleNextPage} disabled><i className="fa-solid fa-angles-right"></i></button>):(<button onClick={handleNextPage}><i className="fa-solid fa-angles-right"></i></button>)}
      </div>
      <div className="seeAllTests" onClick={handleAllTests}>すべてのテストを見る</div>
      </TestsPageTemplate>
    </div>
  </Layout>
}

