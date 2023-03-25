import Layout from "@/components/layout";
import Link from "next/link"
import AuthService from "@/services/auth.service"
import TestService from "@/services/test.service";
import { useState,useEffect } from "react";
import { useRouter } from "next/router"

export async function getStaticPaths(){
  const response = await fetch("http://127.0.0.1:8080/PredictionTests/");
  const data = await response.json();
  const paths = data.map(d =>{
    return {
      params:{
        id:d._id,
      }
    }
  });
  return {
    paths,
    fallback:false,//這樣當使用者隨便輸入一串不存在的_id時才不會引起bug
  }
}

//getStaticPaths()後必須接getStaticProps()才能正常運作
//但getStaticProps()本身可以單獨使用

export async function getStaticProps({params}){
  const response = await fetch(`http://127.0.0.1:8080/PredictionTests/${params.id}`);
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

  console.log(data.answer)

  // document.querySelector("div.answer").style.color = "blue";
  
  let predictedArr = [];
  let flag;

  useEffect(()=>{
    if(!isCurrentUserExist){
      setCurrentUser(AuthService.getCurrentUser());
      setIsCurrentUserExist(true);
    }else{
      console.log("當前使用者："+currentUser.user._id.toString())
      console.log("出題者："+data.publisher._id.toString())
      if(currentUser.user._id.toString() == data.publisher._id.toString()){
        console.log("是自己出的題目")
        if(data.isWaitingForAnswering){
          console.log("可以對答案了")
          setCanCheck(true);
          console.log(canCheck)
        }
        for(let choice in data.choices){
          if(!data.choices[choice].answerer.length){
            //まだ誰も回答していなければ編集できる
            setCanEdit(true);
          }else{
            setCanEdit(false);
            break;
          }
        }
        // console.log(currentUser.user.isPenalized)
        if(!currentUser.user.isPenalized && !data.isAnswered){
          setCanDelete(true);
        }
      }
      // console.log(data.choices)
      for(const choice in data.choices){
        data.choices[choice].answerer.map(user=>{
          if(user._id.toString() == currentUser.user._id.toString()){
            console.log("使用者有選過"+choice,user.usePoint)
            document.querySelector(`div#${choice}`).classList.add("selected");
            document.querySelector(`div#${choice}`).insertAdjacentHTML("beforeend",`<p><small>ポイント：${user.usePoint}</small></p>`)
            document.querySelector(`div#${choice}`).style.color = "#888";
            //樣式等之後用CSS改
            if(user.isFlag){
              document.querySelector(`div#${choice}`).classList.add("flag");
              document.querySelector(`div#${choice}`).style.color = "gold";
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
      if(currentUser.user._id.toString() == data.publisher._id.toString()){
        //出題者本人は予知できない
        setCanPredict(false);
      }
    }
    let choices = document.querySelectorAll(`div.choices`);
  
    choices.forEach(choice =>{
      let choiceContent = choice.querySelectorAll("p");
      choiceContent.forEach(p =>{
        if(p.textContent == data.answer){
          choice.classList.add("answer");
        }
      })
    })
    if(data.isAnswered){
      if(document.querySelector("div.answer")){
        document.querySelector("div.answer").style.backgroundColor = "#CCC";
      }
      
      //之後用CSS修改答案的樣式
    }
    
  },[isCurrentUserExist]);

  if(!currentUser){
    return (
      <Layout>
        <h3>ログインしてください。</h3>
      </Layout>
    )
  }

  const handleDelete = async(e) =>{
    console.log("點擊了刪除按鈕")
    console.log(data._id)
    const latestUserData = await fetch(`http://127.0.0.1:8080/profile/${currentUser.user._id}`)
    .then(data=>data.json())
    .catch(e=>console.log(e));
    console.log(latestUserData)

    
    let confirm = window.confirm(`テストが取り下げられます。\n本当によろしいでしょうか？\n現在のペナルティ回数：${latestUserData.foundUser.penaltyCount}`);
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
  
  return (
    <Layout>
    <Link href={`/PredictionTests`}>戻る</Link>
    {msg && <p className="alertMsg">{msg}</p>}
    <div>
      <h2>{`問${data.test_ID}：${data.title}`}</h2>
      {canEdit&&<div className="editTests"><Link href={`/PredictionTests/edit/${data._id}`}>テストを編集する</Link></div>}
      {canDelete&&<div onClick={handleDelete} className="deleteTest"><p style={{cursor:"pointer"}}>テストを取り下げる</p></div>}
      <p>{`ジャンル：${data.genre}`}</p>
      <small>出題者：<Link href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
      <p>{`説明：${data.description}`}</p>
      <p>{`基礎ポイント：${data.bonus}`}</p>
      <p>{data.isAccepting && `テスト状態：回答受付中`}</p>
      <p>{data.isWaitingForAnswering && `テスト状態：答え合わせ待ち`}</p>
      <p>{data.isAnswered && `テスト状態：答え合わせ済み`}</p>
      <div>
        <p>選択肢：</p>
        <div id="one" className="choices">
          <p>{`①：${data.choices.one.des}`}</p>
          <p><small>{`回答者数：${data.choices.one.answerer.length}`}</small></p>
        </div>
        <div id="two" className="choices">
          <p>{`②：${data.choices.two.des}`}</p>
          <p><small>{`回答者数：${data.choices.two.answerer.length}`}</small></p>
        </div>
        <div id="three" className="choices">
          <p>{`③：${data.choices.three.des}`}</p>
          <p><small>{`回答者数：${data.choices.three.answerer.length}`}</small></p>
        </div>
        <div id="four" className="choices">
          <p>{`④：${data.choices.four.des}`}</p>
          <p><small>{`回答者数：${data.choices.four.answerer.length}`}</small></p>
        </div>
        <div id="five" className="choices">
          <p>{`⑤：${data.choices.five.des}`}</p>
          <p><small>{`回答者数：${data.choices.five.answerer.length}`}</small></p>
        </div>
        {data.choices.six.des && <div id="six" className="choices">
          <p>{`⑥：${data.choices.six.des}`}</p>
          <p><small>{`回答者数：${data.choices.six.answerer.length}`}</small></p>
          </div>}
        {data.choices.seven.des && <div id="seven" className="choices">
          <p>{`⑦：${data.choices.seven.des}`}</p>
          <p><small>{`回答者数：${data.choices.seven.answerer.length}`}</small></p>
        </div>}
        {data.choices.eight.des && <div id="eight" className="choices">
          <p>{`⑧：${data.choices.eight.des}`}</p>
          <p><small>{`回答者数：${data.choices.eight.answerer.length}`}</small></p>
        </div>}
      </div>
      <p>{`出題日時：${new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
      <p>{`締め切り：${new Date(data.deadline).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
      {canPredict && data.isAccepting && <Link href={`/toPredict/${data._id}`}>予知を行う</Link>}
      {data.isWaitingForAnswering && <p>このテストはすでに締め切りが過ぎています。</p>}
      {data.isAnswered && <p>このテストはすでに答え合わせ済みです。</p>}
      {canCheck && <Link href={`/CheckOutTheAnswer/${data._id}`}>答え合わせを行う</Link>}
      
    </div>
    </Layout>
  )


}