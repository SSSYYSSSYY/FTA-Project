import Head from "next/head"
import Link from "next/link"
import AuthService from "@/services/auth.service";
import { useState,useEffect } from "react"
import { useRouter } from "next/router"

const websiteTitle = "予言テストサイト";

export default function Layout({children}){
  const router = useRouter();
  const [currentUser,setCurrentUser] = useState(null);
  const [loading,setLoading] = useState(true);
  


  useEffect(()=>{
    setCurrentUser(AuthService.getCurrentUser());
    if (process.browser) {
      window.addEventListener('load', () => {
        console.log('頁面已經加載完成');
      });
    }
  },[]);

  const handleLogout = () =>{
    AuthService.logout();//localStorageに入ってるユーザー情報を削除
    window.alert("ログアウトしました。");
    location.reload();
  }
  //在使用者已經位於特定頁面時，navbar上前往該頁面的按鈕無效化
  // const isProfilePage = router.asPath.includes(`"/profile"`);
  // const isTestsPage = router.asPath.includes("/PredictionTests");

  return <div>
    <Head>
      <meta name="author" content="suEky"/>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>{websiteTitle}</title>
      <link rel="icon" href="/favicon.ico" />
      <style>

      </style>
    </Head>
    <header>
      <br/>
      <p>非公式</p>
      <h1>
        予言者育成<br/>
        予言テストサイト
      </h1>

    </header>
    <nav>
      <ul className="siteNav">
        <li><Link href="/">HOME</Link></li>
        <li><Link href="/news">NEWS</Link></li>
        <li><Link href="/about">ABOUT</Link></li>
        <li><Link href="/PredictionTests">TESTs</Link></li>
        {/* {isTestsPage?(<li><span>予言テスト</span></li>):(<li><Link href="/PredictionTests">予言テスト</Link></li>)} */}
      </ul>
        {currentUser ? (
          
          <ul className="loginNav">
            {/* {isProfilePage?(<li><span>プロフィール</span></li>):(<li><Link href={`/profile/${currentUser.user._id}`}>プロフィール</Link></li>)} */}
            <li><Link href={`/profile/${currentUser.user._id}`}>PROFILE</Link></li>
            <li><Link onClick={handleLogout} href="/">LOGOUT</Link></li>
          </ul>
        ):(
          <ul className="loginNav">
            <li><Link href="/signUp">SIGNUP</Link></li>
            <li><Link href="/login">LOGIN</Link></li>
          </ul>
        )}
    </nav>
    <div id="cover" class="cover">
      <div id="loading" class="ui-circle-loading">
        <ul class="animate">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
      </div>
    </div>
    
    <main>{children}</main>
    <footer>
      <p>予言者育成学園非公式ファンサイト</p>
      {router.asPath.includes("privacy-policy")?(<span>プライバシーポリシー</span>):(<Link href="/privacy-policy">プライバシーポリシー</Link>)}
      {router.asPath.includes("contact")?(<span>お問い合わせ</span>):(<Link href="/contact">お問い合わせ</Link>)}<br/><br/>
      {router.asPath.includes("resource")?(<span>当サイトで使用している素材</span>):(<Link href="/resource">当サイトで使用している素材</Link>)}
      <p>当サイトは、スマホゲーム『予言者育成学園Fortune Teller Academy』の非公式ファンサイトです。</p>
      <p>株式会社スクウェア・エニックス様および予言者育成学園公式様とは一切関係ございません。</p>
      <p>当サイトで使用している画像の著作権などは各権利者に帰属いたします。</p>
    </footer>
  </div>
}


//在其他組件的JS文件中，只要把return的內容放進<Layout></Layout>之中，
//該組件所渲染出的頁面就會包含layout.js中所撰寫的資訊
//(該組件的內容會被放進layout中的children參數)

//可以先考慮整個網站的每個頁面共通的部分，再來撰寫layout.js的內容