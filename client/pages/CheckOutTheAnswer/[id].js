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


export default function CheckOutTheAnswer({data}){
  const router = useRouter();

  const [currentUser,setCurrentUser] = useState(null);
  const [msg,setMsg] = useState("");
  const [answerData,setAnswerData] = useState({});
  const [des,setDes] = useState({});
  //會進到這個頁面代表使用者必定是出題者本人

  const handleAnswerData = (e) =>{
    setAnswerData({
        [e.target.id]:e.target.value,
    });
  }

  const handleDes = (e) =>{
    setDes({[e.target.name]:e.target.value});
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();


    // console.log(des)
    // console.log(answerData);
    const checkOutObj = {...des,...answerData}
    console.log(checkOutObj)
    try{
      await TestService.checkOutTheAnswer(checkOutObj,data._id.toString());
      for(let data in answerData){
        document.querySelector(`div#${data}`).classList.add("answer");
        document.querySelector(`div#${data}`).style.color = "blue";
      }
      window.alert("答え合わせに成功しました！\nテストに戻ります。");
      router.push(`/PredictionTests/${data._id}`);
    }catch(e){
      console.log(e);
    }
  }
  
  return (
    <Layout>
      <p>對答案頁面</p>
      <h2>{`問${data.test_ID}：${data.title}`}</h2>
      <p>{`ジャンル：${data.genre}`}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="test-description">説明：</label>
        <textarea id="test-description" name="description"
        onChange={handleDes} required></textarea>
        <p>選択肢：</p>
        <div id="one" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.one.des} id="one" name="choices" type="radio"/>
          <label htmlFor="one">{`①：${data.choices.one.des}`}</label>
        </div>
        <div id="two" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.two.des} id="two" name="choices" type="radio"/>
          <label htmlFor="two">{`②：${data.choices.two.des}`}</label>
        </div>
        <div id="three" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.three.des} id="three" name="choices" type="radio"/>
          <label htmlFor="three">{`③：${data.choices.three.des}`}</label>
        </div>
        <div id="four" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.four.des} id="four" name="choices" type="radio"/>
          <label htmlFor="four">{`④：${data.choices.four.des}`}</label>
        </div>
        <div id="five" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.five.des} id="five" name="choices" type="radio"/>
          <label htmlFor="five">{`⑤：${data.choices.five.des}`}</label>
        </div>

        {data.choices.six.des && 
        <div id="six" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.six.des} id="six" name="choices" type="radio"/>
          <label htmlFor="six">{`⑥：${data.choices.six.des}`}</label>
        </div>}
        {data.choices.seven.des && 
        <div id="seven" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.seven.des} id="seven" name="choices" type="radio"/>
          <label htmlFor="seven">{`⑦：${data.choices.seven.des}`}</label>
        </div>}
        {data.choices.eight.des && 
        <div id="eight" className="choice CheckOut">
          <input onChange={handleAnswerData} value={data.choices.eight.des} id="eight" name="choices" type="radio"/>
          <label htmlFor="eight">{`⑧：${data.choices.eight.des}`}</label>
        </div>}
        <button type="submit">答え合わせを行う</button>
      </form>
    </Layout>
  )
}