//page資料夾下的index.js用的是"/"的route，也就是網站首頁
import Link from "next/link"
import Layout from "@/components/layout"
import LatestTests from "@/components/latest-tests"
import News from "@/components/news-block"

export default function Home() {
  return (
  <Layout>
    <div>
      <div  id="goToAbout">
        <Link href={`/about`}>当サイトについて　※必読</Link>
      </div>
      
      <LatestTests></LatestTests>
      <News></News>

    </div>
  </Layout>

  )
}
