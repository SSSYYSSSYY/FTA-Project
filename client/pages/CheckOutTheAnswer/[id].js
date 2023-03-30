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
  console.log(des)
  console.log(answerData);

  const handleSubmit = async(e) =>{
    e.preventDefault();



    const checkOutObj = {...des,...answerData}
    console.log(checkOutObj)
    try{
      await TestService.checkOutTheAnswer(checkOutObj,data._id.toString());
      for(let data in answerData){
        document.querySelector(`div.choices.${data}`).classList.add("answer");
        // document.querySelector(`div.choices.${data}`).style.color = "blue";
      }
      window.alert("答え合わせに成功しました！\nテストに戻ります。");
      router.push(`/PredictionTests/${data._id}`);
    }catch(e){
      console.log(e);
    }
  }
  
  return (
    <Layout>
      <h4 className="test-title">{`問${data.test_ID}：${data.title}`}</h4>
      <p className="test-genre">{`ジャンル：${data.genre}`}</p>
      <form className="CheckOutForm" onSubmit={handleSubmit}>
        <label htmlFor="test-description">説明：</label>
        <textarea rows={8} wrap="hard" id="test-description" name="description"
        onChange={handleDes} required></textarea>
        {/* <p>選択肢：</p> */}
        <section className="choicesSection CheckOut">
          <div className="choices one CheckOut">
            <input onChange={handleAnswerData} value={data.choices.one.des} id="one" name="choices" type="radio"/>
            <label htmlFor="one">
              <div className="choiceInfo">
                  <span>①</span>
              </div>
              <p className="choiceContent">{data.choices.one.des}</p>
            </label>
          </div>
          <div className="choices two CheckOut">
            <input onChange={handleAnswerData} value={data.choices.two.des} id="two" name="choices" type="radio"/>
            <label htmlFor="two">
              <div className="choiceInfo">
                <span>②</span>
              </div>
              <p className="choiceContent">{data.choices.two.des}</p>
            </label>
          </div>
          <div className="choices three CheckOut">
            <input onChange={handleAnswerData} value={data.choices.three.des} id="three" name="choices" type="radio"/>
            <label htmlFor="three">
              <div className="choiceInfo">
                <span>③</span>
              </div>
              <p className="choiceContent">{data.choices.three.des}</p>
            </label>
          </div>
          <div className="choices four CheckOut">
            <input onChange={handleAnswerData} value={data.choices.four.des} id="four" name="choices" type="radio"/>
            <label htmlFor="four">
              <div className="choiceInfo">
                <span>④</span>
              </div>
              <p className="choiceContent">{data.choices.four.des}</p>
            </label>
          </div>
          <div className="choices five CheckOut">
            <input onChange={handleAnswerData} value={data.choices.five.des} id="five" name="choices" type="radio"/>
            <label htmlFor="five">
              <div className="choiceInfo">
                <span>⑤</span>
              </div>
              <p className="choiceContent">{data.choices.five.des}</p>
            </label>
          </div>

          {data.choices.six.des && 
          <div className="choices six CheckOut">
            <input onChange={handleAnswerData} value={data.choices.six.des} id="six" name="choices" type="radio"/>
            <label htmlFor="six">
              <div className="choiceInfo">
                <span>⑥</span>
              </div>
              <p className="choiceContent">{data.choices.six.des}</p>
            </label>
          </div>}
          {data.choices.seven.des && 
          <div className="choices seven CheckOut">
            <input onChange={handleAnswerData} value={data.choices.seven.des} id="seven" name="choices" type="radio"/>
            <label htmlFor="seven">
              <div className="choiceInfo">
                <span>⑦</span>
              </div>
              <p className="choiceContent">{data.choices.seven.des}</p>
            </label>
          </div>}
          {data.choices.eight.des && 
          <div className="choices eight CheckOut">
            <input onChange={handleAnswerData} value={data.choices.eight.des} id="eight" name="choices" type="radio"/>
            <label htmlFor="eight">
              <div className="choiceInfo">
                <span>⑧</span>
              </div>
              <p className="choiceContent">{data.choices.eight.des}</p>
            </label>

          </div>}
        </section>
        
        <button type="submit">答え合わせを行う</button>
      </form>
    </Layout>
  )
}