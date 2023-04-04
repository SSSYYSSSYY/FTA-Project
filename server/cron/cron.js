export default async function VercelCronTest(){
  console.log("每分鐘執行排程任務");
  res.send({msg:"排程任務成功"});
}