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
    const minDate = new Date(Date.now()+48*60*60*1000).toISOString().slice(0, 10);
    const maxDate = new Date(Date.now()+3*30*24*60*60*1000).toISOString().slice(0, 10);

    setMinDate(minDate);
    setMaxDate(maxDate);
    setCurrentUser(AuthService.getCurrentUser());
  },[]);

  if(!currentUser){
    return (
      <Layout>
        <h2 className="pleaseLogin">ログインしてください。</h2>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* textarea中可用「\n來換行」 */}
      <form className="newTest" onSubmit={handlePublish}>
        <label htmlFor="test-title">タイトル：</label>
        <textarea rows={2} id="test-title" name="title" required
        minLength="8" placeholder="八文字以上必要です。"
        onChange={handleFormData}></textarea>
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
        <textarea wrap="physical" rows={8} id="test-description" name="description"
        onChange={handleFormData} required placeholder="説明をここにご記入ください。" cols={36}></textarea>
        <br/>
        <div className="choices">
          <p>選択肢：</p>
          <p className="newTestNotice"><small>※①～⑤は必須、各選択肢は最大36文字までとなります。</small></p>
          <label htmlFor="choice-one">①：</label>
          <textarea maxLength={36} rows={2} id="choice-one" name="one" required
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-two">②：</label>
          <textarea maxLength={36} rows={2} id="choice-two" name="two" required
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-three">③：</label>
          <textarea maxLength={36} rows={2} id="choice-three" name="three" required
          onChange={handleFormData}/>
          <label htmlFor="choice-four">④：</label>
          <textarea maxLength={36} rows={2} id="choice-four" name="four" required
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-five">⑤：</label>
          <textarea maxLength={36} rows={2} id="choice-five" name="five" required
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-six">⑥：</label>
          <textarea maxLength={36} rows={2} id="choice-six" name="six"
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-seven">⑦：</label>
          <textarea maxLength={36} rows={2} id="choice-seven" name="seven" 
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-eight">⑧：</label>
          <textarea maxLength={36} rows={2} id="choice-eight" name="eight"
          onChange={handleFormData}></textarea>
          <br/>
        </div>
        <br/>
        <label className="test-deadline" htmlFor="test-deadline">締め切り：</label>
        <input id="test-deadline" name="deadline" type="date" min={minDate} max={maxDate} required onChange={handleFormData}/>
        <p style={{marginBottom:"0rem"}} className="newTestNotice"><small>※締め切りは出題の２日後から９０日後まで選択できます。</small></p>
        <br/>
        <label className="test-bonus" htmlFor="test-bonus">基礎ポイント：</label>
        <input id="test-bonus" name="bonus" type="number" min="20" required placeholder="最低20ポイントが必要です。"
        onChange={handleFormData}/>
        <br/>
        {msg && <div style={{whiteSpace:"pre-wrap",marginBottom:"0rem",marginTop:"1.5rem"}} className="pointAlert">{msg}</div>}
        <br/>
        <button type="submit">出題する</button>
      </form>
    </Layout>

  )
}