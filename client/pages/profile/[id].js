import Layout from "@/components/layout";
import Link from "next/link";
import AuthService from "@/services/auth.service"
import { useRouter } from "next/router";
import { useState,useEffect } from "react";
import ReactPaginate from 'react-paginate';





//目前進度：
  //每個已登入的人都可以看自己和別人的個人檔案，但內容會不一樣
  //需要的資料：1.現在登入的使用者、2.使用者所存取的網址中的_id
  //若當前登入的使用者和使用者想存取的個人檔案的_id不同，則隱藏部分資料

// export async function getStaticPaths(){
//   const response = await fetch(`https://fta-project.vercel.app/profile/`);
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
//   const response = await fetch(`https://fta-project.vercel.app/profile/${params.id}`);
//   const data = await response.json();
//   return {
//     props:{
//       data,
//     },

//   }
// }

export async function getServerSideProps({params}){
  const { id } = params;
  const response = await fetch(`https://fta-project.vercel.app/profile/${id}`);
  const data = await response.json();
  return {
    props:{
      data,
    }
  }
}



export default function UserProfile({data}){
  // console.table(data.foundUser.predictRecord)
  data.foundUser.predictRecord = data.foundUser.predictRecord.reverse();
  data.foundUser.publishRecord = data.foundUser.publishRecord.reverse();
  let isTheUserSame;
  const [expPro,setExpPro] = useState(0);
  
  const [publishCurrentPage,setPublishCurrentPage] = useState(0);
  const [predictCurrentPage,setPredictCurrentPage] = useState(0);
  const pageSize = 5;

  const PublishCurrentData = data.foundUser.publishRecord.slice(publishCurrentPage*pageSize,publishCurrentPage*pageSize+pageSize);
  const predictCurrentData = data.foundUser.predictRecord.slice(predictCurrentPage*pageSize,predictCurrentPage*pageSize+pageSize);  

  let isPublishLastPage = false;
  if(PublishCurrentData.length < 5||data.foundUser.publishRecord.slice((publishCurrentPage+1)*pageSize,(publishCurrentPage+1)*pageSize+pageSize).length == 0){
    isPublishLastPage = true;
  }
  let isPredictLastPage = false;
  if(predictCurrentData.length < 5||data.foundUser.predictRecord.slice((predictCurrentPage+1)*pageSize,(predictCurrentPage+1)*pageSize+pageSize).length == 0){
    isPredictLastPage = true;
  }

  const handlePublishPrePage = (e) =>{
    e.preventDefault();
    console.log("這是上一頁按鈕")
    setPublishCurrentPage(publishCurrentPage - 1);
    
  }

  const handlePublishNextPage = (e) =>{
    e.preventDefault();
    console.log("這是下一頁按鈕")
    setPublishCurrentPage(publishCurrentPage + 1);
    
  }
  const handlePredictPrePage = (e) =>{
    e.preventDefault();
    console.log("這是上一頁按鈕")
    setPredictCurrentPage(predictCurrentPage - 1);
    
  }

  const handlePredictNextPage = (e) =>{
    e.preventDefault();
    console.log("這是下一頁按鈕")
    setPredictCurrentPage(predictCurrentPage + 1);
    
  }
  // console.log("現在是第"+publishCurrentPage+"頁")
  // console.log("這一頁要顯示的資料如下：")
  // console.table(PublishCurrentData)

  //========================================================
  if(!data){
    return <div>Loading...</div>
  }
  const handleExpBar = () =>{
    setExpPro(data.expProgress.toFixed(2));
  }
  const [currentUser,setCurrentUser] = useState(null);
  useEffect(()=>{
    setCurrentUser(AuthService.getCurrentUser());
    setTimeout(handleExpBar,1000);
    
  },[]);
  //AuthService.getCurrentUser();
  //這裡的data會是從後端API傳回的資料

  let timeZonedPenalty = new Date(data.foundUser.penaltyEnd).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});
  let penaltySplitBySpace = timeZonedPenalty.split(" ");
  if(!currentUser){
    return (
      <Layout>
        <h2 className="pleaseLogin">ログインしてください。</h2>
      </Layout>
    )
  }else{
    isTheUserSame = currentUser.user._id.toString()==data.foundUser._id.toString();
    //アクセスしようとしているユーザー＆今ログインしているユーザーが同一人物であるかどうかをチェック
  }
  return (
    <Layout>
    <div className="profileBody">
      <h4>{`ニックネーム：${data.foundUser.nickname}`}</h4>
      <p>{isTheUserSame &&`所持ポイント：${data.foundUser.predictionPoints}`}</p>
      <p>{`予言ランク：${data.foundUser.level}`}</p>
      {isTheUserSame &&<div className="expBar"><div style={{ width: `calc(300 * ${expPro}px)`,transition: "width .5s ease-out" }} className="expBarIn"></div><small>ランクアップまであと{data.foundUser.expForNextLevel}exp</small></div>}
      {isTheUserSame && <p className="penaCounter">{`取り下げ回数：${data.foundUser.penaltyCount}`}</p>}
      {/*下面的 data.foundUser.isPenalized && 暫時先拿掉*/}
      {isTheUserSame && data.foundUser.isPenalized && <div className="isPenalty">
        <p className="penaltyAlert" style={{marginTop:"1rem"}}>ペナルティ期間中のため、出題およびテストの取り下げは行えません。</p>
        <p className="penaltyEnd">{`ペナルティ期間：${penaltySplitBySpace[0]} 23:59:59まで`}</p>
        {/* new Date(data.foundUser.penaltyEnd).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'}) */}
        </div>}
    </div>
    <div className="recordBody">
      <p className="recordTitle">出題記録：</p>
      <ul className="publishRecordsList">
        {data.foundUser.publishRecord.length > 0 ? PublishCurrentData.map((test,index) =>{
          if(!test.isExist|| !test._id){
            return <li className="isNotExist" key={index}>存在しないテストです。</li>
          }
          return (
            <li>
              <Link key={test._id} href={`/PredictionTests/${test._id}`}>{`${test.title}`}</Link>
            </li>
          )
        }):(
          <p>まだ出題したことがないよ！</p>
        )
        }

        {data.foundUser.publishRecord.length >5 &&
        <div className="pagingBtn">
          {publishCurrentPage == 0 ?(<button disabled onClick={handlePublishPrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePublishPrePage}><i className="fa-solid fa-angles-left"></i></button>)}
          {isPublishLastPage?(<button disabled onClick={handlePublishNextPage}><i className="fa-solid fa-angles-right"></i></button>):((<button onClick={handlePublishNextPage}><i className="fa-solid fa-angles-right"></i></button>))}
        </div>}
        
      </ul>
      {isTheUserSame &&<p className="recordTitle">回答記錄：</p>}
      {isTheUserSame &&<ul className="predictRecordsList">
        {(data.foundUser.predictRecord.length > 0 ? predictCurrentData.map((test,index) =>{
          if(!test.isExist || !test._id){
            return <li className="isNotExist" key={index}>存在しないテストです。</li>
          }
          return (
            <li>
               <Link key={test._id} href={`/PredictionTests/${test._id}`}>{`${test.title}`}</Link><br/>
               <p className="counter">予知回数：{`${test.predictedSum}/4`}</p>
               {test.isAccurate && <p className="accurateMsg">的中！</p>}
            </li>
            )
        }):(
          <p>まだ回答したことがないよ！</p>
        ))}

        {isTheUserSame &&data.foundUser.predictRecord.length > 5 && 
        <div className="pagingBtn">
          {predictCurrentPage == 0?(<button disabled onClick={handlePredictPrePage}><i className="fa-solid fa-angles-left"></i></button>):(<button onClick={handlePredictPrePage}><i className="fa-solid fa-angles-left"></i></button>)}
          {isPredictLastPage?(<button disabled onClick={handlePredictNextPage}><i className="fa-solid fa-angles-right"></i></button>):(<button onClick={handlePredictNextPage}><i className="fa-solid fa-angles-right"></i></button>)}
        </div>}

      </ul>}
    </div>
    </Layout>
  )
}

