import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";

export default function About(){
  return (
    <Layout>
      <section className="about">
        <h3>本サイトをご覧になっている皆さんへ</h3>
        <p>本サイトは、予言者育成学園卒業生が立ち上げた、<strong className="highlighter brown">ちょっとした二次創作</strong>のようなものです。</p>
        <br/>
        <div className="linkToFTA">
          <p>予言者育成学園ってなんぞや？って方は以下をご覧ください。</p>
          <br/>
          <a target="_blank" href="https://twitter.com/fta_pr">予言者育成学園公式ツイッター</a>
          <br/>
          <a target="_blank" href="https://ja.wikipedia.org/wiki/%E4%BA%88%E8%A8%80%E8%80%85%E8%82%B2%E6%88%90%E5%AD%A6%E5%9C%92_Fortune_Tellers_Academy">予言者育成学園　Wikipedia</a>
        </div>

        <br/>
        <p>本サイトは、ログインさえすれば、<strong className="highlighter blue">誰でも</strong><strong className="highlighter blue">予言テストを出せる、回答できる</strong>サービスです。</p>
        
        <br/><p>これでみんなジャン先生です。</p><br/>
        <Link className="toRules" href="/rules">予言テストのルールなどはこちらへ</Link><br/>
        <p>現在は予言テストを中心に運営しておりますが、チャットルームやフレンド機能など、かつて予言者育成学園にあった機能も（わたしの能力次第で）実装する予定です。</p>
        <p>どうぞお楽しみに、と言いたいところなんですが、ウェブ開発においてはまだまだ初心者なので大口は叩けません。すみません。作れたらいいな。
        </p><br/>
        <Link className="toContact" href="/contact">不具合の報告や要望などはこちらへ</Link>
        <br/>
        <p>二次創作なので、広告を掲載するなど収益を得るようなことをする予定は一切ございません。
        <br/>
        が、広告は悪！という意味ではないです。念のため。</p><br/>
        <p>また、わいせつ・差別・そのほか公序良俗に反するものなど<strong className="highlighter yellow">他人に不快感を与える表現</strong>は、お控えいただきますようお願い申し上げます。</p>
        <p>なお、不適切な内容などに対する通報機能はまだ開発中です。</p>
        <p>当面は上記にあるお問い合わせフォームにご記入いただき、こちらで対応いたします。</p><br/>
        <p>まあ通報機能なんかなくても不適切な内容は書いちゃダメなんですよね。
        </p>
        <p>そういったことをするような人たちではないと、わたしは予言者の皆さんを信じています。</p><br/>
        <p>では、良き予知ライフを！</p>
        <br/>
        <p className="author">予言者育成学園卒業生・すえきりさめ　より</p>
      </section>

    </Layout>
  )
}