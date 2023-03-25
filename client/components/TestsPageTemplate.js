import Link from "next/link"
import AuthService from "@/services/auth.service"
import { useRouter } from "next/router";
import { useState,useEffect } from "react";
import styles from "../styles/testtemplate.module.css"
import { CSSTransition, TransitionGroup } from 'react-transition-group';


export default function TestsPageTemplate({children}){
  const router = useRouter();
  const [currentUser,setCurrentUser] = useState(null);
  const [isPenalized,setIsPenalized] = useState(false)
  const [menuActive,setMenuActive] = useState(false);

  const handleActive = () =>{
    setMenuActive(!menuActive);
    //在使用react時，因為一般的「透過改變class來改變樣式」方式並不會觸發重新渲染，所以最好要用state來管理樣式
  }

  useEffect(()=>{
    setCurrentUser(AuthService.getCurrentUser());
  },[]);
  //這裡嘗試fetch最新的使用者資料以判斷是否在懲罰期間

  // console.log(latestUserData)
  let latestUserData;
  useEffect(()=>{
  //介面動畫用


    if(currentUser){
      fetch(`http://127.0.0.1:8080/profile/${currentUser.user._id}`)
      .then(data=>data.json())
      .then(data=>{
        latestUserData = data;
        if(latestUserData.foundUser.isPenalized){
          setIsPenalized(true);
        }
      })
      .catch(e=>{
        console.log(e);
      })
    }
  },[currentUser])
  // console.log(latestUserData)
  const isGourmetPage = decodeURI(router.asPath).includes("/グルメ");
  const isEnterPage = decodeURI(router.asPath).includes("/芸能");
  const isTrendPage = decodeURI(router.asPath).includes("/時事・トレンド");
  const isSportsPage = decodeURI(router.asPath).includes("/スポーツ");
  const isACGPage = decodeURI(router.asPath).includes("/アニメ・ゲーム");
  const isPEPage = decodeURI(router.asPath).includes("/政治経済");
  const isTriviaPage = decodeURI(router.asPath).includes("/趣味・雑学");
  const isNoneGenrePage = decodeURI(router.asPath).includes("/ノンジャンル");
  // console.log(isGourmetPage)





  
  return (
  <div>
    <Link href="/rules">予言テストのルールはこちらへ</Link>
    <p onClick={handleActive} id="accordion-genre" className={`${styles.accordion} ${menuActive?styles.active:""}`}>ジャンルで絞る：</p>
      <div className={styles.genreNav}>
        {isGourmetPage?(<span className="nowGenre">グルメ</span>):(<Link href={`/PredictionTests/genre/グルメ`}>グルメ</Link>)}
        {isEnterPage?(<span className="nowGenre">芸能</span>):(<Link href={`/PredictionTests/genre/芸能`}>芸能</Link>)}
        {isTrendPage?(<span className="nowGenre">時事・トレンド</span>):(<Link href={`/PredictionTests/genre/時事・トレンド`}>時事・トレンド</Link>)}
        {isSportsPage?(<span className="nowGenre">スポーツ</span>):(<Link href={`/PredictionTests/genre/スポーツ`}>スポーツ</Link>)}
        {isACGPage?(<span className="nowGenre">アニメ・ゲーム</span>):(<Link href={`/PredictionTests/genre/アニメ・ゲーム`}>アニメ・ゲーム</Link>)}
        {isPEPage?(<span className="nowGenre">政治経済</span>):(<Link href={`/PredictionTests/genre/政治経済`}>政治経済</Link>)}
        {isTriviaPage?(<span className="nowGenre">趣味・雑学</span>):(<Link href={`/PredictionTests/genre/趣味・雑学`}>趣味・雑学</Link>)}
        {isNoneGenrePage?(<span className="nowGenre">ノンジャンル</span>):(<Link href={`/PredictionTests/genre/ノンジャンル`}>ノンジャンル</Link>)}
      </div>

    
  <div className="byStatus" style={{padding:"1rem"}} >
    {router.asPath.includes("isAccepting")?(<span className="nowStatus">回答受付中</span>):(<Link href="/PredictionTests/status/isAccepting">回答受付中</Link>)}
    {router.asPath.includes("isWaitingForAnswering")?(<span className="nowStatus">答え合わせ待ち</span>):(<Link href="/PredictionTests/status/isWaitingForAnswering">答え合わせ待ち</Link>)}
    {router.asPath.includes("isAnswered")?(<span className="nowStatus">答え合わせ済み</span>):(<Link href="/PredictionTests/status/isAnswered">答え合わせ済み</Link>)}
  </div>
  {isPenalized? (<div className="penaltyAlert">ペナルティ期間中は出題できません。</div>):(<div className="publishBtn"><Link style={{padding:"1rem"}} href="/PredictionTests/newTest">出題する</Link></div>)}
  <div className="allTests" style={{padding:"1rem"}}>
    <Link href={`/PredictionTests`}>すべてのテストを見る</Link>
  </div>
    <main>{children}</main>

  </div>)
}