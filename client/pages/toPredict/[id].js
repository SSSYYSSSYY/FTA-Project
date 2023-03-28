import Layout from "@/components/layout";
import Link from "next/link"
import AuthService from "@/services/auth.service"
import TestService from "@/services/test.service";
import { useState,useEffect } from "react";
import { useRouter } from "next/router"


let usePointFromUser = 0;
let isFlagFromUser = false;

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


export default function Predict({data}){
  const router = useRouter();


  const [currentUser,setCurrentUser] = useState(null);
  const [msg,setMsg] = useState("");
  const [selectedChoice,setSelectedChoice] = useState({});
  const [predictData,setPredictData] = useState({
    usePoint:20,
    isFlag:false,
  });

  const [isCurrentUserExist,setIsCurrentUserExist] = useState(false);
  const [canPredict,setCanPredict] = useState(true);

  let predictedArr = [];
  let flag;
  useEffect(()=>{
    if(!isCurrentUserExist){
      setCurrentUser(AuthService.getCurrentUser());
      setIsCurrentUserExist(true);
    }else{
      console.log("當前使用者"+currentUser.user._id.toString())

      // console.log(data.choices)
      for(const choice in data.choices){
        data.choices[choice].answerer.map(user=>{
          if(user._id.toString() == currentUser.user._id.toString()){
            console.log("使用者有選過"+choice,user);
            document.querySelector(`div#${choice}`).classList.add("isSelected");
            document.querySelector(`div#${choice}`).style.color = "#888";
            document.querySelector(`input#${choice}`).disabled = true;
            if(user.isFlag){
              document.querySelector(`div#${choice}`).classList.add("FLAG");
              document.querySelector(`div#${choice}`).style.color = "gold";
              document.querySelector(`div.isFlag`).style.display = "none";
            }
            predictedArr.push(choice)
            if(user.isFlag){
              flag = choice;
            }
          }

        })
      }
      // console.log(predictedArr)
      if(predictedArr.length>=4){
        setMsg("予知回数が上限に達しています。");
        setCanPredict(false);
      }
    }
  },[isCurrentUserExist]);

  //目標是送出一個包含「選項」「是否插旗」「花費點數」的物件
  const handleChoice = (e) =>{
    setSelectedChoice({[e.target.id]:e.target.value});
  }
  
  const handlePredictData = (e) =>{
    if(e.target.type == "number"){
      usePointFromUser = e.target.value;
    }
    let flagCheckbox = document.getElementById("isFlag");

    isFlagFromUser = flagCheckbox.checked;
    setPredictData({
      usePoint:Number(usePointFromUser),
      isFlag:isFlagFromUser,
    });
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();

    const predictObj = {...selectedChoice,...predictData};
    // console.log(selectedChoice)
    // console.log(predictData)
    // console.log(predictObj)//真正用來發送請求的物件
    
    const latestUserData = await fetch(`http://127.0.0.1:8080/profile/${currentUser.user._id}`)
    .then(data=>data.json())
    .catch(e=>console.log(e));
    if(predictObj.usePoint > latestUserData.foundUser.predictionPoints){
      setMsg(`所持ポイントが足りないよ！\n現在の所持ポイント：${latestUserData.foundUser.predictionPoints}`);
    }else{
      try{
        
        await TestService.predict(predictObj,data._id.toString());
        window.alert("予知が成功しました！");
        router.push(`/PredictionTests/${data._id}`);
      }catch(e){
        console.log(e);
      }
      
    }

  }

  if(!currentUser){
    return (
      <Layout>
        <h3>ログインしてください。</h3>
      </Layout>
    )
  }
  return(
    <Layout>
      <h2>{`問${data.test_ID}：${data.title}`}</h2>
      <p>{`ジャンル：${data.genre}`}</p>
      <small>出題者：<Link href={`/profile/${data.publisher._id}`}>{data.publisher.nickname}</Link></small>
      <p>{`基礎ポイント：${data.bonus}`}</p>
      <form onSubmit={handleSubmit}>
        <p>選択肢：</p>
        <div id="one" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.one.des} id="one" name="choices" type="radio"/>
          <label htmlFor="one">{`①：${data.choices.one.des}`}</label>
        </div>
        <div id="two" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.two.des} id="two" name="choices" type="radio"/>
          <label htmlFor="two">{`②：${data.choices.two.des}`}</label>
        </div>
        <div id="three" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.three.des} id="three" name="choices" type="radio"/>
          <label htmlFor="three">{`③：${data.choices.three.des}`}</label>
        </div>
        <div id="four" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.four.des} id="four" name="choices" type="radio"/>
          <label htmlFor="four">{`④：${data.choices.four.des}`}</label>
        </div>
        <div id="five" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.five.des} id="five" name="choices" type="radio"/>
          <label htmlFor="five">{`⑤：${data.choices.five.des}`}</label>
        </div>

        {data.choices.six.des && 
        <div id="six" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.six.des} id="six" name="choices" type="radio"/>
          <label htmlFor="six">{`⑥：${data.choices.six.des}`}</label>
        </div>}
        {data.choices.seven.des && 
        <div id="seven" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.seven.des} id="seven" name="choices" type="radio"/>
          <label htmlFor="seven">{`⑦：${data.choices.seven.des}`}</label>
        </div>}
        {data.choices.eight.des && 
        <div id="eight" className="choice toPredict">
          <input onChange={handleChoice} value={data.choices.eight.des} id="eight" name="choices" type="radio"/>
          <label htmlFor="eight">{`⑧：${data.choices.eight.des}`}</label>
        </div>}
        {<div className="isFlag">
          <input id="isFlag" name="isFlag" onChange={handlePredictData} type="checkbox" value={true}/>
          <label htmlFor="isFlag">自信あり</label>
        </div>}
        <div className="usePoint">
          <label htmlFor="usePoint">投入するポイント：</label>
          <input onChange={handlePredictData} name="usePoint" type="number" min="20" id="usePoint" required/>
        </div>
        {msg && <div style={{whiteSpace:"pre-wrap"}} className="pointAlert">{msg}</div>}
        <button type="submit">予知を行う</button>
      </form>
      <p>{`出題日時：${new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
      <p>{`締め切り：${new Date(data.deadline).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`}</p>
    </Layout>
  )
}
