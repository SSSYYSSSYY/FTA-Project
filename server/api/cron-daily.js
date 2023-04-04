require("dotenv").config();

const mongoose = require("mongoose");
const PredictionTest = require("../models/prediction-test");
const News = require("../models/news");
const User = require("./models").User;
const nodemailer = require("nodemailer");

//環境変数
const PASSWORD_SECRET = process.env.PASSWORD_SECRET;
const GMAIL = process.env.GMAIL_ACCOUNT;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

export default async function handler(req, res) {
  console.log("執行cron")
  // res.status(200).end('Hello Cron!');

  //每天0點判斷題目是否過期
  let nowTimeObj = new Date();
  let allTest = await PredictionTest.find({}).exec();
  allTest.map(async(test)=>{
      //console.log(`すべてのテストの締め切りは${test.deadline}`);
      if((nowTimeObj > test.deadline || nowTimeObj == test.deadline ) && (test.isAccepting == true)){
          //締め切りを過ぎたかつ「受付中」のテストのstatusを更新する
          console.log(`${test.title}は締め切りを過ぎたよ！`);
          console.log(`締め切りを過ぎたテストのID${test._id}`)
          console.log(`出題者は${test.publisher._id}`)
          let publisher = await User.findOne({_id:test.publisher._id});
          console.log(`出題者のメールアドレスは${publisher.email}`)

          const transporter = nodemailer.createTransport({
              service:"Gmail",
              auth:{
                  user:GMAIL,
                  pass:GMAIL_PASSWORD,
              }
          });

          const mailOptions = {
              from:GMAIL,
              to:publisher.email,
              subject:`締め切りを過ぎた予言テストがあります。`,
              html:`予言テスト：${test.title}が締め切りになりました。<br /><a href="http://localhost:3000/PredictionTests/${test._id}">答え合わせはこちらへ</a>`,
          }

          transporter.sendMail(mailOptions, function(err,info){
              if(err){
                  console.log("傳送失敗：");
                  console.log(err)
                  // return res.status(500).send("予期せぬエラーが発生しました。");
              }else{
                  console.log("傳送成功：");
                  console.log(info);
                  // return res.send("お問い合わせありがとうございます。\nご報告いただいた内容については、後ほど改めてご連絡させていただきます。\nホームに戻ります。")
              }
          });

          await PredictionTest.findOneAndUpdate({test_ID:test.test_ID},{isAccepting:false,isWaitingForAnswering:true},{new:true});
          console.log(test.title+"の状態を更新したよ！");
      }
  })
  //每天0點判斷懲罰期間是否結束
  let allUser = await User.find({isPenalized:true}).exec();

  allUser.map(async user =>{
      console.log(`玩家${user._id}的懲罰期間是${user.penaltyEnd}`)
      if((nowTimeObj > user.penaltyEnd || nowTimeObj == user.penaltyEnd ) && (user.isPenalized == true)){
          console.log(`玩家${user._id}的懲罰期間已過`);
          await User.findOneAndUpdate({_id:user._id},{isPenalized:false,penaltyCount:0},{new:true});
          console.log(`已更新玩家${user._id}的懲罰狀態`);
      }
  })
}