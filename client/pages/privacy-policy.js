import Link from "next/link"
import Layout from "@/components/layout"
import { useRouter } from "next/router";

export default function PrivacyPolicy(){
  return (
    <Layout>
      <section className="privacy-policy">
        <h3>プライバシーポリシー</h3>
        <h4>収集する個人情報の種類：</h4>
        <ul>
          <li>ユーザーのニックネーム</li>
          <li>ユーザーのメールアドレス</li>
        </ul>
        <h4>個人情報の収集目的：</h4>
        <ul>
          <li>通知・連絡といったサービスの提供</li>
          <li>お問い合わせへの対応</li>
        </ul>
        <h4>個人情報の収集範囲：</h4>
        <ul>
          <li>当サイトにてご記入いただいた情報</li>
          <li>お問い合わせフォームにてご提供いただいた情報</li>
        </ul>
        <h4>個人情報の第三者への提供について：</h4>
        <p className="miniTitle">ユーザーからご提供いただいた個人情報は、以下のような場合で第三者に開示または提供することがあります。</p>
        <ul>
          <li>ユーザーの同意・承諾を得た場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合で、ユーザーご本人の同意を得ることが困難な場合
          </li>
          <li>その他、個人情報の提供が必要な場合</li>
        </ul>
        <h4>個人情報の開示、訂正、削除について：</h4>
        <ul>
          <li>ユーザーはご自身の個人情報について、開示、訂正、削除などを要求することができます</li>
          <li>個人情報について、開示、訂正、削除などのお問い合わせは、<Link href={`/contact`}>こちら</Link>までご連絡ください</li>
        </ul>
        <h4>免責事項：</h4>
        <ul>
          <li>当サイトに掲載された情報の真偽については、責任を一切負いません</li>
          <li>ユーザーが個人情報を第三者に漏洩した場合は、責任を一切負いません</li>
        </ul>
        <h4>プライバシーポリシーの変更：</h4>
        <ul>
          <li>当サイトは、プライバシーポリシーを変更することがあります</li>
          <li>プライバシーポリシーの変更があった場合は、お知らせページにて掲載いたします</li>
        </ul>
        <p className="miniTitle">当サイトは、ユーザーのパスワードを暗号化し、個人情報の漏洩がないようセキュリティ対策を講じていますが、インターネットの性質上、不正アクセスを完全に防ぐことはできません。</p>
        <p className="miniTitle">ご了承の上、当サイトをご利用ください。</p>
      </section>

    </Layout>
  )
}