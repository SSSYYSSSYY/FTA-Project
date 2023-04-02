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

export default function EditTest({data}){
  const router = useRouter();
  
  

  const [currentUser,setCurrentUser] = useState(null);
  const [msg,setMsg] = useState("");

  const [formData,setFormData] = useState({
    title:data.title,
    genre:data.genre,
    description:data.description,
    one:data.choices.one.des,
    two:data.choices.two.des,
    three:data.choices.three.des,
    four:data.choices.four.des,
    five:data.choices.five.des,
    six:data.choices.six.des,
    seven:data.choices.seven.des,
    eight:data.choices.eight.des,
  });
  console.log(formData)
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
  const handleEdit = async(e) =>{
    e.preventDefault();
    if(choiceAlert){
      if(alertCounter>= 3){
        window.alert("順番通りにって言ったよね！もう～最低！");
      }else{
        alertCounter++;
        window.alert("選択肢は順番通りに入力してください。");
      }
    }else{
        try{
          await TestService.edit(formData.title,formData.genre,formData.description,formData.one,formData.two,formData.three,formData.four,formData.five,formData.six,formData.seven,formData.eight,data._id);
          window.alert("テストの編集に成功しました。");
          router.push(`/PredictionTests/${data._id}`);
            // await TestService.publish(formData.title,formData.genre,formData.description,formData.one,formData.two,formData.three,formData.four,formData.five,formData.six,formData.seven,formData.eight,formData.deadline,formData.bonus);
            // window.alert("出題が成功しました！予言テストページに遷移します。");
            // await new Promise((resolve) => setTimeout(resolve,1000));
            // router.push("/PredictionTests");
        }catch(e){
            console.log(e)
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
        <h3>ログインしてください。</h3>
      </Layout>
    )
  }

  return (
    <Layout>
      <form className="edit" onSubmit={handleEdit}>
        <label htmlFor="test-title">タイトル：</label>
        <textarea rows={2}value={formData.title} id="test-title" name="title"  required
        minLength="8" placeholder="八文字以上必要です。"
        readOnly></textarea>
        <p style={{margin :"-1rem 0 1rem"}}><small>※タイトルは編集できません。</small></p>
        <label htmlFor="test-genre">ジャンル：</label>
        <select value={formData.genre} id="test-genre" name="genre" required
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
        <label htmlFor="test-description">説明文：</label>
        <textarea wrap="physical" rows={8} value={formData.description} id="test-description" name="description"
        onChange={handleFormData}></textarea>
        <br/>
        <div className="choices">
          <p>選択肢：</p>
          <p className="newTestNotice"><small>※①～⑤は必須、各選択肢は最大36文字までとなります。</small></p>
          <label htmlFor="choice-one">①：</label>
          <textarea maxLength={36} rows={2}value={formData.one} id="choice-one" name="one" required
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-two">②：</label>
          <textarea maxLength={36} rows={2}value={formData.two} id="choice-two" name="two" required
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-three">③：</label>
          <textarea maxLength={36} rows={2}value={formData.three} id="choice-three" name="three"  required
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-four">④：</label>
          <textarea maxLength={36} rows={2}value={formData.four} id="choice-four" name="four"  required
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-five">⑤：</label>
          <textarea maxLength={36} rows={2}value={formData.five} id="choice-five" name="five"  required
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-six">⑥：</label>
          <textarea maxLength={36} rows={2}value={formData.six} id="choice-six" name="six" 
          onChange={handleFormData}></textarea>
          <br/>
          <label htmlFor="choice-seven">⑦：</label>
          <textarea maxLength={36} rows={2}value={formData.seven} id="choice-seven" name="seven" 
          onChange={handleFormData}></textarea>
          <label htmlFor="choice-eight">⑧：</label>
          <textarea maxLength={36} rows={2}value={formData.eight} id="choice-eight" name="eight" 
          onChange={handleFormData}></textarea>
          <br/>
        </div>
        <br/>
        <label className="test-deadline" htmlFor="test-deadline">締め切り：</label>
        <input value={data.deadline.slice(0,10)} id="test-deadline" name="deadline" type="date" min={minDate} max={maxDate} required readOnly/>
        <p><small>※締め切りは編集できません。</small></p>
        <br/>
        <label className="test-bonus" htmlFor="test-bonus">基礎ポイント：</label>
        <input value={data.bonus} id="test-bonus" name="bonus" type="number" min="20" required readOnly/>
        <p><small>※基礎ポイントは編集できません。</small></p>
        <br/>
        {msg && <div style={{whiteSpace:"pre-wrap"}} className="pointAlert">{msg}</div>}
        <br/>
        <button type="submit">編集する</button>
      </form>
    </Layout>
  )
}