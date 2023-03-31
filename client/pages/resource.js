import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";

export default function Resource(){
  return(
    <Layout>
      <div className="resourcePage">
        <h2>当サイトで使用している素材</h2>

        <p className="title">背景画像：</p>
        <a target="_blank" href="https://www.wowpatterns.com/free-vector/abstract-minimal-doodle-line-brush-strokes-seamless-vector-pattern">wowpatterns.com</a>
        <br/><br/>
        <p className="title">フレーム、飾り線など：</p>
        <a target="_blank" href="https://frames-design.com/">フレームデザイン</a>
        <br/><br/>
        <p className="title">フォント：</p>
        <a target="_blank" href="https://cute-freefont.flop.jp/okoneya_geneiratemin.html">源暎ラテミン</a>
        <br/><br/>
        <p className="title">ファビコン：</p>
        <a target="_blank" href="https://favicon.io/">favicon.io</a>
      </div>
    </Layout>
  )
}