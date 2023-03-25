//這裡是製作新題目的表單頁面
//還沒完成，要先來做登入頁面

//useState的部分可以看signUp功能是怎麼用的

import Layout from "@/components/layout";
import Link from "next/link";
import AuthService from "@/services/auth.service"
import TestService from "@/services/test.service";
import { useState,useEffect } from "react";
import { useRouter } from "next/router"

export default function NewTest(){
  const router = useRouter();

  const [currentUser,setCurrentUser] = useState(null);
  const [msg,setMsg] = useState("");

  const [formData,setFormData] = useState({
    title:"",
    genre:"",
    description:"",
    one:"",
    two:"",
    three:"",
    four:"",
    five:"",
    six:"",
    seven:"",
    eight:"",
    deadline:"",
    bonus:"",
  });
  let choiceAlert = false;
  if((formData.eight != "" && (formData.six == "" || formData.seven == ""))||
  formData.seven != "" && (formData.six == "")){
    choiceAlert = true;
  }else{
    choiceAlert = false;
  }
  
  const handleFormData = (e) =>{
    setFormData(prevState =>({
      ...prevState,
      [e.target.name]:e.target.value,
    }));
    // console.log(e.target.name);
    // console.log(e.target.value);
  }
  // console.log(formData)
  const [minDate,setMinDate] = useState("");
  const [maxDate,setMaxDate] = useState("");
  let alertCounter = 0;
  const handlePublish = async(e) =>{
    e.preventDefault();
    if(choiceAlert){
      if(alertCounter>= 3){
        window.alert("順番通りにって言ったよね！もう～最低！");
      }else{
        alertCounter++;
        window.alert("選択肢は順番通りに入力してください。");
      }
    }else{
        if(formData.bonus>currentUser.user.predictionPoints){
          setMsg(`所持ポイントが足りないよ！\n現在の所持ポイント：${currentUser.user.predictionPoints}`);
        }else{
          try{
            let newDate = new Date(formData.deadline).toISOString().slice(0,-1);
            newDate += "+09:00";
            let checkDate = new Date(newDate).toISOString();
            formData.deadline = newDate;
            console.log(newDate)
            console.log(checkDate)
            await TestService.publish(formData.title,formData.genre,formData.description,formData.one,formData.two,formData.three,formData.four,formData.five,formData.six,formData.seven,formData.eight,formData.deadline,formData.bonus);
            window.alert("出題が成功しました！予言テストページに遷移します。");
            await new Promise((resolve) => setTimeout(resolve,1000));
            router.push("/PredictionTests");
          }catch(e){
            console.log(e)
          }
        }

    }
  }
  

  useEffect(()=>{
    //在測試階段最小日期先暫時改成24小時
    const minDate = new Date(Date.now()+24*60*60*1000).toISOString().slice(0, 10);
    const maxDate = new Date(Date.now()+3*30*24*60*60*1000).toISOString().slice(0, 10);

    setMinDate(minDate);
    setMaxDate(maxDate);
    setCurrentUser(AuthService.getCurrentUser());
  },[]);

  if(!currentUser){
    return (
      <Layout>
        <h3>ログインしてください。</h3>
      </Layout>
    )
  }

  return (
    <Layout>
      <form onSubmit={handlePublish}>
        <label htmlFor="test-title">タイトル：</label>
        <input id="test-title" name="title" type="text" required
        minLength="8" placeholder="八文字以上必要です。"
        onChange={handleFormData}/>
        <label htmlFor="test-genre">ジャンル：</label>
        <select id="test-genre" name="genre" required defaultValue=""
        onChange={handleFormData}>
          <option value="" disabled hidden>ジャンルを選択してください</option>
          {/*之後要限制這裡不可為空*/}
          <option value="グルメ">グルメ</option>
          <option value="芸能">芸能</option>
          <option value="時事・トレンド">時事・トレンド</option>
          <option value="スポーツ">スポーツ</option>
          <option value="アニメ・ゲーム">アニメ・ゲーム</option>
          <option value="政治経済">政治経済</option>
          <option value="趣味・雑学">趣味・雑学</option>
          <option value="ノンジャンル">ノンジャンル</option>
        </select>
        <br/>
        <label htmlFor="test-description">説明：</label>
        <textarea id="test-description" name="description"
        onChange={handleFormData} required placeholder="説明をここにご記入ください。" cols={36} rows={8}></textarea>
        <br/>
        <div className="choices">
          <p>選択肢：</p>
          <p><small>※①～⑤は必須です。</small></p>
          <label htmlFor="choice-one">①：</label>
          <input id="choice-one" name="one" type="text" required
          onChange={handleFormData}/>
          <label htmlFor="choice-two">②：</label>
          <input id="choice-two" name="two" type="text" required
          onChange={handleFormData}/>
          <br/>
          <label htmlFor="choice-three">③：</label>
          <input id="choice-three" name="three" type="text" required
          onChange={handleFormData}/>
          <label htmlFor="choice-four">④：</label>
          <input id="choice-four" name="four" type="text" required
          onChange={handleFormData}/>
          <br/>
          <label htmlFor="choice-five">⑤：</label>
          <input id="choice-five" name="five" type="text" required
          onChange={handleFormData}/>
          <label htmlFor="choice-six">⑥：</label>
          <input id="choice-six" name="six" type="text"
          onChange={handleFormData}/>
          <br/>
          <label htmlFor="choice-seven">⑦：</label>
          <input id="choice-seven" name="seven" type="text"
          onChange={handleFormData}/>
          <label htmlFor="choice-eight">⑧：</label>
          <input id="choice-eight" name="eight" type="text"
          onChange={handleFormData}/>
          <br/>
        </div>
        <br/>
        <label htmlFor="test-deadline">締め切り：</label>
        <input id="test-deadline" name="deadline" type="date" min={minDate} max={maxDate} required onChange={handleFormData}/>
        <p><small>※締め切りは出題の48時間後から90日後まで選択できます。</small></p>
        <br/>
        <label htmlFor="test-bonus">基礎ポイント：</label>
        <input id="test-bonus" name="bonus" type="number" min="20" required placeholder="最低20ポイントが必要です。"
        onChange={handleFormData}/>
        <br/>
        {msg && <div style={{whiteSpace:"pre-wrap"}} className="pointAlert">{msg}</div>}
        <br/>
        <button type="submit">出題する</button>
      </form>
    </Layout>

  )
}