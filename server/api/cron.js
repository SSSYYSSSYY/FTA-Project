export default function handler(req, res) {
  console.log("執行cron")
  res.status(200).end('Hello Cron!');
}