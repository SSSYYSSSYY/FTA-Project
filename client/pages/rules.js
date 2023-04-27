import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";

export default function Rules(){

  return (
    <Layout>
      <div className="rulesBody">
        <h2>予言テストの流れ</h2>
        <section className="signUpAndLoginCorner">
          <p>1.まずは登録。</p>
          <p>2.登録完了したら自動にログイン画面に遷移します。<br/>ここで先ほど登録したアカウントとパスワードを入力します。</p>
          <p>3.ログイン成功したら、自動にプロフィール画面に遷移します。</p>
          <img width={`300px`} src="/pictures/profile.png"/>
          <div className="profileCorner">
            <p className="title">プロフィールについて：</p>
            <div className="aboutPoint">
              <p className="blockTitle">ポイントの獲得方法：</p>
              <ul>
                <li>1.アカウントを作成する際、初期ポイントとして500ポイントが付与されます。</li>
                <li>2.予知が的中すると、報酬としてポイントが付与されます。</li>
                <p><small className="hint">※的中者の報酬は、出題者が設定した「基礎ポイント」と予知する際に投入したポイントによって変動します。<br/>
                テストの基礎ポイントと投入したポイントが多ければ多いほど、報酬が高くなります。<br/>
                また、「自信あり」の選択肢が的中した場合は、報酬が2倍になります。</small></p>
                <li>3.予言テストを出題し、答え合わせを行うと、報酬としてポイントが付与されます。</li>
                <p><small className="hint">※出題者の報酬は、出題する際に設定した「基礎ポイント」と全回答者が投入したポイントによって変動します。<br/>
                テストの基礎ポイントと全回答者が投入したポイントが多ければ多いほど、報酬が高くなります。</small></p>
                <div className="BTWAboutBonus">
                  <p>また、答え合わせを行えば<strong>最低でも「基礎ポイント」×7</strong>のポイントを獲得できます。</p>
                  <p>これがどういうことかといいますと、<strong>たとえ誰も回答していなくても、ちゃんと答え合わせを行えばポイントを失うことはありません。</strong></p><br/>
                </div>

              </ul>
              <p className="blockTitle">ポイントの使い方：</p>
              <ul>
                <li>1.予言テストを出題する際に決めた「基礎ポイント」は、出題者の所持ポイントから引かれます。</li>
                <li>2.予知を行う際には、どれくらいのポイントを投入するかが決められます。</li>
                <p><small className="hint">※なお、基礎ポイントと投入するポイントは両方とも最低20ポイントが必要です。</small></p>
              </ul>
            </div>
            <div className="aboutExp">
              <p className="blockTitle">経験値の獲得方法：</p>
              <ul>
                <li>1.予知の一回につき、経験値50を獲得できます。</li>
                <li>2.予知が的中したら、さらに経験値200を獲得できます。</li>
                <p><small className="hint">
                ※「自信あり」の選択肢が的中した場合は、経験値400を獲得できます。</small></p>
                <li>3.予言テストを出題し、答え合わせを行うと、経験値400を獲得できます。</li>
              </ul>
            </div>
            <div id="aboutPenalty" className="aboutPenalty">
              <p className="blockTitle">「ペナルティ」について：</p>
              <p>1.テストの取り下げを行うたびに「取り下げ回数」が増えます。<br/>この「取り下げ回数」が三回になると、「ペナルティ」を課せられ、十日間の「ペナルティ期間」に入ります。</p>
              <p>2.「ペナルティ期間」では<strong>出題＆取り下げができない</strong>ので、くれぐれもご注意ください。</p>
              <p>3.「取り下げ回数」は毎月一日3時にリセットされます。<br/>つまり、毎月は二回までペナルティなしに取り下げができます。</p>
            </div>
          </div>
          
        </section>
        <section className="publishCorner">
          <p className="title"><strong>出題</strong>について：</p>
          <p>1.こちらの「出題する」をクリック。</p>
          <img width={`300px`} src="/pictures/publishBtn.png"/>
          {/* 查一下有沒有更好的控制寬高的方式 */}
          <p>2.次にこのようなフォームが出てきます。</p>
          <img width={`300px`} src="/pictures/publishForm.png"/>
          <p>3.タイトル、ジャンル、説明、選択肢、締め切りと基礎ポイントなどを入力。<br/>入力が終わったら「出題する」をクリック。</p>
          <img width={`300px`} src="/pictures/publishConfirm.png"/>
          <p>4.完成！</p>
          <img width={`300px`} src="/pictures/publishSuccess.png"/>
          {/* 題目的說明的「そんな島に」改成「そんな島で」
          「重度な方向音痴で、その上びびり屋だからである」
          重新截圖*/}
          <p><small>※「説明はこちらへ」をクリックすれば、先ほど入力した説明文が出てきます。こんな感じです。<br/>ジャン先生になりきって説明を考えてみましょう。</small></p>
          <img width={`300px`} src="/pictures/publishDes.png"/>
          <p className="patch">「編集」について：<br/><small>※テストの編集は「まだ誰も回答していない」＆テストが「回答受付中」の場合に限る。</small></p>
          <p>1.「編集する」をクリック。</p>
          <img width={`300px`} src="/pictures/testNav.png"/>
          <p>2.出題するときと同じようなフォームが出てきますが、<strong>編集できるのは「説明」と「選択肢」のみ</strong>で、それ以外は編集できませんので、ご注意ください。</p>
          <p className="delete">「取り下げ」について：</p>
          <img width={`300px`} src="/pictures/testNav.png"/>
          <p>1.「取り下げる」をクリックすると、確認メッセージが出てきます。</p>
          <img width={`300px`} src="/pictures/deleteConfirm.png"/>
          {/* 換圖片 */}
          <p>2.「取り下げ回数」については<Link href="#aboutPenalty" passHref>こちら</Link>。</p>

        </section>
        <section className="predictCorner">
          <p className="title"><strong>予知</strong>について：</p>
          <p>1.他人の出題したかつ回答受付中のテストのページでは、「予知を行う」のボタンが出てきます。これをクリック。</p>
          <img width={`300px`} src="/pictures/predict.png"/>
          <p>2.入れたい選択肢をクリックし、旗を立てるかどうかと投入するポイントを決め、「予知を行う」をクリック。<br/></p>
          <img width={`300px`} src="/pictures/toPredict.png"/>
          <p>4.完成！<br/>また、一つのテストに対して、最大４回まで予知できます。</p>
          <img width={`300px`} src="/pictures/predictSuccess.png"/>
          <p><small>※ちなみに、旗立ててない選択肢はピンクになります。</small></p>
          <img width={`300px`} src="/pictures/predictPink.png"/>
        </section>
        <section className="checkOutCorner">
          <p className="title"><strong>答え合わせ</strong>について：</p>
          <p>1.締め切りを過ぎたテストのページでは、「答え合わせを行う」のボタンが出てきます。これをクリック。</p>
          <img width={`300px`} src="/pictures/checkOut.png"/>
          <p>2.正解となる選択肢を決めて、「答え合わせを行う」をクリック。</p>
          <img width={`300px`} src="/pictures/toCheckOut.png"/>
          <p><small>※選択肢をクリックすると、このように該当選択肢の内容が「説明」のところに出てきます。</small></p>
          <p>3.完成！
            <br/>このように正解となった選択肢はふんわりと光るようになります。
          </p>
          <img width={`300px`} src="/pictures/checkOutSuccess.png"/>
          <p><small>※光り具合については、色々調整してたらこんな感じに落ち着いたのですが、「こんなの分からないよー！」とか「眩しすぎるー！」って方がいらっしゃったら教えていただけると幸いです…</small></p>
          <p><small>※ちなみに説明文は、先ほど入力した内容に変わります。</small></p>
          <img width={`300px`} src="/pictures/checkOutedDes.png"/>
        </section>
        <p>※なお、本サイトはVercelの無料プランを利用しており、無料プランのCron Jobs（テストの締め切りが過ぎたどうか＆ペナルティ期間が過ぎたどうかなどを自動的に判断するもの）は<strong>一時間以内の遅延が生じる</strong>ことがあります。<br/>例えば、締め切りが4月16日0時のテストは、4月16日0時50分でやっと締め切りになることがあります。そこらへんは悪しからず……<br/><br/>予言テストの流れは以上です。<br/>不明点がありましたら、<Link href={`/contact`}>こちら</Link>までご連絡ください。
        </p>
      </div>

    </Layout>
  )
}