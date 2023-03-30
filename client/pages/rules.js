import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";

export default function Rules(){
  return (
    <Layout>
      <div className="rulesBody">
        <section className="publishCorner">
          <h2>予言テストルール</h2>
          <p>まずは、<span className="highlighter yellow">出題</span>について：</p>
          <p>1.こちらの「出題する」をクリック。</p>
          <img width={`300px`} src="/pictures/publishBtn.png"/>
          {/* 查一下有沒有更好的控制寬高的方式 */}
          <p>2.次にこのようなフォームが出てきます。</p>
          <img width={`300px`} src="/pictures/publishForm.png"/>
          <p>3.タイトル、ジャンル、説明、選択肢、締め切りと基礎ポイント<small>※</small>などを入力。<br/>入力が終わったら「出題する」をクリック。</p>
          <img width={`300px`} src="/pictures/publishConfirm.png"/>
          <p>4.完成！</p>
          <img width={`300px`} src="/pictures/publishSuccess.png"/>
          <p>ちなみに「説明はこちらへ」をクリックすれば、先ほど入力した説明文が出てきます。</p>
          <img width={`350px`} src="/pictures/publishDes.png"/>
          <p>また、テストを編集することもできます。<br/>ただし、<strong>「まだ誰も回答していない」＆テストが「回答受付中」</strong>の場合に限る。</p>
          <p>「編集する」をクリック。</p>
          <img width={`300px`} src="/pictures/testNav.png"/>
          <p>出題するときと同じようなフォームが出てきますが、<strong>編集できるのは「説明」と「選択肢」のみ</strong>で、それ以外は編集できませんので、ご注意ください。</p>
          <p>では、「取り下げ」について：</p>
          <img width={`300px`} src="/pictures/testNav.png"/>
          <p>「取り下げる」をクリックすると、確認メッセージが出てきます。</p>
          <img width={`300px`} src="/pictures/deleteConfirm.png"/>
          <p>テストの取り下げを行うたびに「ペナルティ回数」が増えます。<br/>この「ペナルティ回数」が三回になると、「ペナルティ」を課せられ、十日間の「ペナルティ期間」に入ります。</p>
          <p>「ペナルティ期間」では<strong>出題＆取り下げが行えない</strong>ので、ご注意ください。</p>
          <p>また、「ペナルティ回数」は毎月一日でリセットされます。つまり、毎月は二回までペナルティなしに取り下げができます。</p>
        </section>
        <section className="predictCorner">
          <p>では、「予知」について：</p>
          <p>1.他人の出題したかつ回答受付中のテスト画面では、「予知を行う」のボタンが出てきます。これをクリック。</p>
          <img width={`300px`} src="/pictures/predict.png"/>
          <p>2.入れたい選択肢をクリック。</p>
          <img width={`300px`} src="/pictures/toPredict.png"/>
          {/* 數字框要加大所以這張圖之後要改 先做到這裡*/}
        </section>

      </div>

    </Layout>
  )
}