import Layout from "@/components/layout";
import Link from "next/link"
import AuthService from "@/services/auth.service"
import TestService from "@/services/test.service";
import { useState,useEffect } from "react";
import { useRouter } from "next/router"

// export async function getStaticPaths(){
//   const response = await fetch("https://fta-project.vercel.app/PredictionTests/");
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

// //getStaticPaths()後必須接getStaticProps()才能正常運作
// //但getStaticProps()本身可以單獨使用

// export async function getStaticProps({params}){
//   const response = await fetch(`https://fta-project.vercel.app/PredictionTests/${params.id}`);
//   const data = await response.json();
//   return {
//     props:{
//       data,
//     }
//   }
// }

export async function getServerSideProps({params}){
  const { id } = params;
  const response = await fetch(`https://fta-project.vercel.app/PredictionTests/${id}`);
  const data = await response.json();
  return {
    props:{
      data,
    }
  }
}

export default function Test({data}){
  const router = useRouter();
  //這裡的data會是從後端API傳回的資料，所以結構會和在後端時寫的相同
  const [currentUser,setCurrentUser] = useState(null);
  const [isCurrentUserExist,setIsCurrentUserExist] = useState(false);
  const [msg,setMsg] = useState("");
  const [canPredict,setCanPredict] = useState(true);
  const [canEdit,setCanEdit] = useState(false);
  const [canDelete,setCanDelete] = useState(false);
  const [canCheck,setCanCheck] = useState(false);
  const [isCorrect,setIsCorrect] = useState(false);

  const [isShowDes,setIsShowDes] = useState(false);

  // document.querySelector("div.answer").style.color = "blue";
  
  let predictedArr = [];
  let flag;

  useEffect(()=>{
    if(!isCurrentUserExist){
      setCurrentUser(AuthService.getCurrentUser());
      setIsCurrentUserExist(true);
    }else{
      if(currentUser){
        console.log("當前使用者："+currentUser.user._id.toString())
        console.log("出題者："+data.publisher._id.toString())
        
        if(currentUser.user._id.toString() == data.publisher._id.toString()){
          // console.log("是自己出的題目")
          for(let choice in data.choices){
            if(data.isAccepting &&!data.choices[choice].answerer.length){
              //statusが「回答受付中」であるかつまだ誰も回答していなければ編集できる
              setCanEdit(true);
            }else{
              setCanEdit(false);
              break;
            }
          }
          //當前使用者為出題者本人，且當前使用者未受懲罰，且當前題目未結束
          if(currentUser){
            fetch(`https://fta-project.vercel.app/profile/${currentUser.user._id}`)
            .then(Data=>Data.json())
            .then(Data=>{
              if(!Data.foundUser.isPenalized&& !data.isAnswered){
                setCanDelete(true);
              }else{
                setCanDelete(false);
              }
            })
            .catch(e=>console.log(e));
          }
          // if(!currentUser.user.isPenalized && !data.isAnswered){
          //   setCanDelete(true);
          // }else{
          //   setCanDelete(false);
          // }
          console.log("currentUser.user.isPenalized"+currentUser.user.isPenalized)
          console.log("data.isAnswered"+data.isAnswered)
          if(data.isWaitingForAnswering){
            console.log("可以對答案了")
            setCanCheck(true);
            console.log(canCheck)
          }}else{
            // console.log("不是自己出的題目")
          }
      


        // console.log(currentUser.user.isPenalized)
      }
      // console.log(data.choices)
      for(const choice in data.choices){
        data.choices[choice].answerer.map(user=>{
          if(currentUser && user._id.toString() == currentUser.user._id.toString()){
            console.log("使用者有選過"+choice,user.usePoint)
            document.querySelector(`div#${choice}`).classList.add("selected");
            document.querySelector(`div#${choice} .choiceInfo span`).insertAdjacentHTML("afterend",`<span><small>P：${user.usePoint}</small></span>`)
            // document.querySelector(`div#${choice}`).style.color = "#888";
            //樣式等之後用CSS改
            if(user.isFlag){
              document.querySelector(`div#${choice}`).classList.add("flag");
              
              // document.querySelector(`div#${choice}`).style.color = "gold";
              //樣式等之後用CSS改
            }
            predictedArr.push({
              choice,
              usePoint:user.usePoint
            })
            if(user.isFlag){
              flag = choice;
            }
          }

        })
      }
      console.log(predictedArr.findIndex(item => item.choice.includes('two')))
      if(predictedArr.length>=4){
        setMsg("予知回数が上限に達しています。");
        setCanPredict(false);
      }
      if(currentUser && currentUser.user._id.toString() == data.publisher._id.toString()){
        //出題者本人は予知できない
        setCanPredict(false);
      }
    }
    let choices = document.querySelectorAll(`div.choices`);
  
    choices.forEach(choice =>{
      let choiceContent = choice.querySelectorAll("p");
      choiceContent.forEach(p =>{
        if(p.textContent == data.answer.slice(2)){
          choice.classList.add("answer");
          console.log(data.answer)
          //這邊要改
          if(currentUser.user._id.toString() == data.publisher._id.toString()){
            console.log("是自己出的題目")
          }else{
            console.log("不是自己出的題目")
            if(document.querySelector(".selected.answer")){
              console.log("使用者有答對")
              document.querySelector(".testBody").insertAdjacentHTML("afterbegin",`<div class="correctMsg">的中</div>`)
            }else{
              console.log("使用者沒答對")
              document.querySelector(".testBody").insertAdjacentHTML("afterbegin",`<div class="incorrectMsg">ハズレ…</div>`)
            }
          }

        }
      })
    })

    
  },[isCurrentUserExist]);

  if(!currentUser){
    return (
      <Layout>
        <h2 className="pleaseLogin">ログインしてください。</h2>
      </Layout>
    )
  }

  const handleDelete = async(e) =>{
    console.log("點擊了刪除按鈕")
    console.log(data._id)
    const latestUserData = await fetch(`https://fta-project.vercel.app/profile/${currentUser.user._id}`)
    .then(data=>data.json())
    .catch(e=>console.log(e));
    console.log(latestUserData)

    
    let confirm = window.confirm(`テストが取り下げられます。\n本当によろしいでしょうか？\n現在の取り下げ回数：${latestUserData.foundUser.penaltyCount}`);
    if(confirm){
      console.log("確定要刪除")
      try{
        await TestService.delete(data._id);
        window.alert(`取り下げに成功しました。`);
        router.push("/PredictionTests");
      }catch(e){
        console.log(e);
      }
    }
    
  }
  const showDes = (e) =>{
    console.log("開啟說明文")
    setIsShowDes(true)
  }
  const closeDes = (e) =>{
    setIsShowDes(false)
  }
  
  return (
    <Layout>
    {msg && <p className="alertMsg">{msg}</p>}
    <div className="testBody">
      <div className="navInTest">
        <Link className="goBack" href={`/PredictionTests`}>戻る</Link>
        {canEdit&&<div className="editTests"><Link href={`/PredictionTests/edit/${data._id}`}>編集する</Link></div>}
        {canDelete&&<div onClick={handleDelete} className="deleteTest"><p style={{cursor:"pointer"}}>取り下げる</p></div>}
      </div>
      {/* <p className="testStatus">{data.isAccepting && `テスト状態：回答受付中`}</p>
      <p className="testStatus">{data.isWaitingForAnswering && `テスト状態：答え合わせ待ち`}</p>
      <p className="testStatus">{data.isAnswered && `テスト状態：答え合わせ済み`}</p> */}
      {data.isAccepting?(<p className="testStatus"><span>回答受付中</span></p>):(null)}
      {data.isWaitingForAnswering?(<p className="testStatus"><span>答え合わせ待ち</span></p>):(null)}
      {data.isAnswered?(<p className="testStatus"><span>答え合わせ済み</span></p>):(null)}
      <h4>{`問${data.test_ID}：${data.title}`}</h4>
      <p className="genre">{`ジャンル：${data.genre}`}</p>
      <p className="basicPoint">基礎ポイント：<span>{data.bonus}</span></p>
      <p onClick={showDes}  className="description">説明はこちらへ</p>
      {isShowDes && <p id="description">{data.description}</p>}
      
      {isShowDes && <div onClick={closeDes} className="mask"></div>}
      {/* <p>選択肢：</p> */}
      <section className="choicesSection">
        <div id="one" className="choices">
          <div className="choiceInfo">
            <span>①</span>
            <span><small>{`${data.choices.one.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.one.des}</p>
        </div>
        <div id="two" className="choices">
          <div className="choiceInfo">
            <span>②</span>
            <span><small>{`${data.choices.two.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.two.des}</p>
        </div>
        <div id="three" className="choices">
          <div className="choiceInfo">
            <span>③</span>
            <span><small>{`${data.choices.three.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.three.des}</p>
        </div>
        <div id="four" className="choices">
          <div className="choiceInfo">
            <span>④</span>
            <span><small>{`${data.choices.four.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.four.des}</p>
        </div>
        <div id="five" className="choices">
          <div className="choiceInfo">
            <span>⑤</span>
            <span><small>{`${data.choices.five.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.five.des}</p>
        </div>
        {data.choices.six.des && <div id="six" className="choices">
          <div className="choiceInfo">
            <span>⑥</span>
            <span><small>{`${data.choices.six.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.six.des}</p>
          </div>}
        {data.choices.seven.des && <div id="seven" className="choices">
          <div className="choiceInfo">
            <span>⑦</span>
            <span><small>{`${data.choices.seven.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.seven.des}</p>
        </div>}
        {data.choices.eight.des && <div id="eight" className="choices">
          <div className="choiceInfo">
            <span>⑧</span>
            <span><small>{`${data.choices.eight.answerer.length}人`}</small></span>
          </div>
          <p className="choiceContent">{data.choices.eight.des}</p>
        </div>}
      </section>
      <div className="datesOfTest">
        <p>{`出題日時：${new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
        <p>{`締め切り：${new Date(data.deadline).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
      </div>
      
      {canPredict && data.isAccepting && <Link className="goToPredict" href={`/toPredict/${data._id}`}>予知を行う</Link>}
      <div className="statusMsg">
        {data.isWaitingForAnswering && <p>このテストはすでに締め切りが過ぎています。</p>}
        {data.isAnswered && <p>このテストはすでに答え合わせ済みです。</p>}
      </div>
      
      {canCheck && <Link className="goToCheck" href={`/CheckOutTheAnswer/${data._id}`}>答え合わせを行う</Link>}
      <br/>
      <small className="publisher">出題者：<Link href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
    </div>
    </Layout>
  )


}