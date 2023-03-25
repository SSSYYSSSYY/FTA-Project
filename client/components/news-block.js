import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function News() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://127.0.0.1:8080/news/");
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  const latestFive = data.slice(0,5);

  return (
    <div className="latestNewses">
      <h3>お知らせ</h3>
      <ul>
        {latestFive && 
          latestFive.map(data =>{
            return (
            <li className="latestNews" key={data._id}>
              <p className="postDate"><small>{new Date(data.postDate).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}</small></p>
              <Link href={`/news/${data._id}`}>{data.title}</Link>
              
            </li>
            )
          })
        }
      </ul>
    </div>
  );
}
