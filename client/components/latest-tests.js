import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LatestTests() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("https://fta-project.vercel.app/PredictionTests/");
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  const latestFive = data.slice(0,5);

  return (
    <div className="latestTests">
      <h3>新着テスト</h3>
      <ul>
        {latestFive && 
          latestFive.map(test =>{
            return (
            <li className="latestTest" key={test._id}>
              <Link target="_blank" href={`/PredictionTests/${test._id}`}>{`問${test.test_ID}：${test.title}`}</Link>
              <br/>
              <Link className="publisher" href={`/profile/${test.publisher._id}`}><small>{`出題者：${test.publisher.nickname}`}</small></Link>
            </li>
            )
          })
        }
      </ul>
      <Link className="allTests" href={`/PredictionTests`}>すべてのテストを見る</Link>
    </div>
  );
}
