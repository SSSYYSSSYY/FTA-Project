import Link from "next/link"
import AuthService from "@/services/auth.service"
import { useRouter } from "next/router";
import { useState,useEffect } from "react";

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

  return (
    <div>
      <div className="testsTemplate">
        <Link className="toRules" href="/rules">予言テストのルールはこちらへ</Link>

        {isPenalized? (<div className="penaltyAlert">ペナルティ期間中は出題できません。</div>):(<div className="publishBtn"><Link style={{padding:"1rem"}} href="/PredictionTests/newTest">出題する</Link></div>)}
      </div>
      <main>{children}</main>
    </div>

  )
}