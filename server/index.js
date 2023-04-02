require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PredictionTest = require("./models/prediction-test");
const News = require("./models/news");
const nodemailer = require("nodemailer");

//環境変数
const PASSWORD_SECRET = process.env.PASSWORD_SECRET;
const GMAIL = process.env.GMAIL_ACCOUNT;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

const cors = require("cors");
const cron = require("cron");
//自動的にテスト状態を判断するためのパッケージ

//ログイン機能
const passport = require("passport");
require("./config/passport")(passport);
const User = require("./models").User;
const jwt = require("jsonwebtoken");
const { use } = require("passport");
const { findOneAndUpdate } = require("./models/prediction-test");

//使用NEXT.js串接複數個API?

    //未來新增倍率功能時要自動判斷倍率?
    //是否要製作倍率功能，等整個服務上線後看大家反應?
    //若有要做的話，要仔細評估每個使用者初始持有的點數
    //仿照原本遊戲的模式，倍率每天更新一次就好，也可以省流量

//MongoDBに連携する
mongoose.connect(process.env.MONGODB_CONNECTION)
.then(()=>{
    console.log("MongoDBへの連携に成功しました。");
})
.catch((e)=>{
    console.log(e);
});

//ミドルウェア
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());


const requiredAuth = passport.authenticate("jwt",{session:false});
//passportでユーザーがログイン状態であるかどうかを検証する
// /PredictionTests系Routeはログインしたユーザーのみがアクセスできる

//お問い合わせ用Routes＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

app.post("/contact",(req,res)=>{
    let {nickname,email,formData} = req.body;

    const transporter = nodemailer.createTransport({
        service:"Gmail",
        auth:{
            user:GMAIL,
            pass:GMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from:email,
        to:GMAIL,
        subject:`${nickname}さんからのお問い合わせがありました。`,
        text:`送信元アドレス：${email}\nお問い合わせ内容：\n${formData}`,
    }

    transporter.sendMail(mailOptions, function(err,info){
        if(err){
            console.log(err);
            return res.status(500).send("予期せぬエラーが発生しました。");
        }else{
            console.log(`${nickname}さんからのお問い合わせがあるよ！`);
            return res.send("お問い合わせありがとうございます。\nご報告いただいた内容については、後ほど改めてご連絡させていただきます。\nホームに戻ります。")
        }
    });
});

//お知らせ用Routes＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

app.get("/news",async(req,res)=>{
    try{
        let foundNews = await News.find({}).exec();
        foundNews = foundNews.reverse();
        return res.send(foundNews);
    }catch(e){
        return res.status(500).send("予期せぬエラーが発生しました。");
    }
});

app.get("/news/:_id", async(req,res)=>{
    let {_id} = req.params;
    try{
        let foundNews = await News.findOne({_id}).exec();
        return res.send(foundNews);
    }catch(e){
        return res.status(500).send("予期せぬエラーが発生しました。");
    }
})

app.post("/news",async(req,res)=>{
    try{
        let {title,description,postDate} = req.body;
        let newsObj = new News({title,description,postDate});

        let savedNews = await newsObj.save();
        return res.send({
            msg:"お知らせの保存に成功しました。",
            savedNews,
        })
    }catch(e){
        return res.status(500).send("お知らせの保存に失敗しました。");
    }
});

//ログイン用Routes＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

app.get("/signUp",async(req,res)=>{
    //↓挙動検証用
    let allUser = await User.find({}).exec();
    console.log("新規登録用Routeでリクエストを送られました。")
    //↑挙動検証用
    return res.send(allUser);
    //あとでここに登録画面を置く
});

//新規登録のためのRoute
app.post("/signUp",async(req,res)=>{
    const usernameExist = await User.findOne({username:req.body.username});
    if (usernameExist) return res.status(400).send("このユーザーネームは既に使われています。");

    let {nickname,username,password,email,createdDate,predictionPoints} = req.body;
    let newUser = new User({nickname,username,password,email,createdDate,predictionPoints});

    if(username === "admin0"){
        console.log("管理員註冊");
        newUser.isAdmin = true;
    }

    try{
        const emailExist = await User.findOne({email:req.body.email});
        //以使用者輸入的email為搜尋條件，搜尋資料庫中是否有其他資料的email屬性具有相同的值
        if (emailExist) return res.status(400).send("このメールアドレスは既に使われています。");

        //ユーザーが入力した情報をSchemaに入れる
        let savedUser = await newUser.save();
        
        return res.send({
            msg:"ユーザー情報の保存に成功しました。",
            savedUser,
        });
    }catch(e){
        return res.status(500).send("ユーザー情報の保存に失敗しました。");
    }
});

//登録済みユーザーがログインするためのRoute
app.post("/login",async(req,res)=>{
    const foundUser = await User.findOne({username:req.body.username});
    if (!foundUser)return res.status(401).send("このユーザーは存在していません。");

    foundUser.comparePassword(req.body.password,(err,isMatch)=>{
        console.log("ここからcomparePasswordでパスワードが正確であるどうかを判断します。");
        if (err)return res.status(501).send(err);
        //ここでエラーが出たら＝bcryptでエラーが出た
        if(isMatch){
            //isMatchがtrue＝ユーザーの入力したパスワードが正確である
            //JWTを作る
            const tokenObject = {_id:foundUser._id,nickname:foundUser.nickname};
            const token = jwt.sign(tokenObject,process.env.PASSWORD_SECRET);
            
            return res.send({
                msg:"ログイン成功しました。",
                token:"JWT "+token,
                //"JWT "←ここの半角スペースは必要
                user:foundUser,
            });
        }else{
            //isMatchがfalse＝ユーザーが入力したパスワードが不正確である
            return res.status(401).send("パスワードが不正確です。");
        }
    });
});

app.get("/profile",async(req,res)=>{
    //すべてのユーザー情報を取得する
    try{
        let foundUser = await User.find({}).exec();
        return res.send(foundUser);

    }catch(e){
        return res.status(500).send("予期せぬエラーが発生しました。");
    }
});

app.get("*/profile/:_id",async(req,res)=>{
    let {_id} = req.params;
    try{
        let foundUser = await User.findOne({_id}).populate("publishRecord",["title"]).exec();
        let publishRecord = await PredictionTest.populate(foundUser.publishRecord, {path: '_id', select: 'title'});
        // console.log(publishRecord)

        foundUser.publishRecord = publishRecord;


        let userLevel = foundUser.calculateLevel();

        let remainExp = foundUser.expNeededForNextLevel();
        let expProgress = foundUser.expProgress();
        
        foundUser = await User.findByIdAndUpdate(_id,{level:userLevel,expForNextLevel:remainExp,publishRecord},{new:true}).exec();
        return res.send({
            foundUser,
            expProgress,//這裡輸出的會是小數點後兩位
        });

    }catch(e){
        return res.status(404).send("このユーザーは存在していません。");
    }
});


//予言テスト用Routes＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
//あとでGET系Routesにページング機能を追加

//すべてのテストを取得する
app.get("/PredictionTests",async(req,res)=>{
    
    try{
        //ページング機能はある程度フロントエンドができてからやる

        let foundTest = await PredictionTest.find({}).populate("publisher",["nickname"]).exec();
        foundTest = foundTest.reverse();
        //↓挙動検証用

        //分頁功能：express-paginate或mongoose-paginate套件?
        //↑挙動検証用
        
        return res.send(foundTest);
    }catch(e){
        console.log(e);
        return res.status(500).send("データにアクセスする際に予期せぬエラーが発生しました。");
    }
});

//特定のテストを見る
app.get("/PredictionTests/:_id",async(req,res)=>{
    let {_id} = req.params;
    try{
        let foundTest = await PredictionTest.findOne({_id}).populate("publisher",["nickname"]).exec();
        return res.send(foundTest);
    }catch(e){
        return res.status(404).send("このテストは存在していません。");
    }
});

//ジャンルで絞る
app.get("/PredictionTests/genre/:genre",async(req,res)=>{
    let {genre} = req.params;
    try{
        let foundTest = await PredictionTest.find({genre}).populate("publisher",["nickname"]).exec();
        foundTest = foundTest.reverse();
        
        return res.send(foundTest);
    }catch(e){
        return res.status(500).send("データにアクセスする際に予期せぬエラーが発生しました。");
    }
});

//回答受付中の予言テストを見る
app.get("*/status/isAccepting",async(req,res)=>{
    try{
        let foundTest = await PredictionTest.find({isAccepting:true}).populate("publisher",["nickname"]).exec();
        foundTest = foundTest.reverse();
        
        return res.send(foundTest);
    }catch(e){
        return res.status(500).send("データにアクセスする際に予期せぬエラーが発生しました。");
    }
});


//答え合わせ待ちの予言テストを見る
app.get("*/status/isWaitingForAnswering",async(req,res)=>{
    try{
        let foundTest = await PredictionTest.find({isWaitingForAnswering:true}).populate("publisher",["nickname"]).exec();
        foundTest = foundTest.reverse();
        return res.send(foundTest);
    }catch(e){
        return res.status(500).send("データにアクセスする際に予期せぬエラーが発生しました。");
    }
});


//答え合わせ済みの予言テストを見る
app.get("*/status/isAnswered",async(req,res)=>{
    try{
        let foundTest = await PredictionTest.find({isAnswered:true}).populate("publisher",["nickname"]).exec();
        foundTest = foundTest.reverse();
        
        return res.send(foundTest);
    }catch(e){
        return res.status(500).send("データにアクセスする際に予期せぬエラーが発生しました。");
    }
});


//新しいテストを作成する
app.post("/PredictionTests/newTest",requiredAuth,async(req,res)=>{
    try{
        //http://127.0.0.1:8080/PredictionTests/newTest

        
        let {title,genre,description,postDate,one,two,three,four,five,six,seven,eight,deadline,bonus}=req.body;
        //ここに今ログインしているアカウントの情報を出題者として記録する
        //JWT持っている＝ログインしている、
        //JWT持ってない＝ログインしていない

        //ペナルティ期間中であるかどうかをチェック
        if(req.user.isPenalized){
            console.log(req.user)
            return res.status(400).send("ペナルティ期間中では出題することができません。");
        }

        //所持ポイントが足りているかどうかをチェック
        if(req.user.predictionPoints < bonus){
            return res.send("所持ポイントが足りません。");
        }

        deadline = new Date(deadline);
        let changedFromReqDeadline = deadline.toISOString();
        //リクエストに含まれた締め切りデータをDate()に入れて、
        //さらに.toISOString()でMongoDBのDateと同じ形式に変換する

        let newTest = new PredictionTest({
            title,
            genre,
            description,
            postDate,
            deadline:changedFromReqDeadline,
            choices:{
                one:{
                    des:one,
                },
                two:{
                    des:two,
                },
                three:{
                    des:three,
                },
                four:{
                    des:four,
                },
                five:{
                    des:five,
                },
                six:{
                    des:six,
                },
                seven:{
                    des:seven,
                },
                eight:{
                    des:eight,
                },
            },
            publisher:req.user._id,
            bonus,
        });
        let savedTest = await newTest.save();
        let newTestForUser = {
            title:title,
            _id:savedTest._id,
        }
        let currentUser = await User.findOne({_id:req.user._id}).exec();
        currentUser.publishRecord.push(newTestForUser);
        await currentUser.save();
        //作成したテストをユーザーの出題履歴に記録する
        
        //基礎ポイントは所持ポイントから引く
        let point = req.user.predictionPoints - bonus;
        let savedPoint = await User.findOneAndUpdate({_id:req.user._id},{predictionPoints:point},{
            new:true,
        });
        return res.send({
            msg:`出題に成功しました。現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            savedTest,
        })
    }catch(e){
        return res.status(400).send(e.message);
    }
});

/*
予知を行う流れ：
1：/PredictionTestsにGET
2：/PredictionTests/：_idで特定のテストを見る
3：/PredictionTests/：_idページで「予知を行う」ボタンを置く
4：「予知を行う」ボタンをクリックすれば「/toPredict/:_id」に行く
5：予知が完了したら「/PredictionTests/：_id」に戻る、
    各選択肢のstyleは、answerer配列に今のユーザーの_idが「入ってない」選択肢だけ予知できる
*/

//予知を行うためのRoute
app.post("/toPredict/:_id",requiredAuth,async(req,res)=>{
    //このRouteに選択肢を含んだリクエストを送れば
    //その選択肢に「入れる」ことになる

    let {_id} = req.params;

    //リクエストには「選択肢」と「ポイント数」と「自信ありであるかどうか」を含んでいる
    let reqObj = req.body;
    //在前端限制「一定要選一個選項」和「一定要輸入點數」才能送出

    try{
        //1：該当テストは「回答受付中」でなければならない
            //フロントエンドでも「回答受付中のテストのみが『予知を行う』ボタンが出現する」ようにする
        //2：出題者本人は回答できない
            //フロントエンドでも「出題者以外のユーザーがログインしている場合のみ
            //『予知を行う』ボタンが出現する」ようにする
            
        //回答しようとしているユーザーの情報
        let currentUser = await User.findOne({_id:req.user._id}).exec();

        let foundTest = await PredictionTest.findOne({_id}).exec();
        if(!foundTest){
            return res.status(404).send("このテストは存在していません。");
        }

        //在測試階段先不要做此限制
        // if(currentUser._id.toString() == foundTest.publisher._id.toString()){
        //     return res.send("出題者本人は予知できません。");
        // }
        

        if(foundTest.isWaitingForAnswering){
            return res.send("このテストはすでに締め切りです。");
        }else if(foundTest.isAnswered){
            return res.send("このテストはすでに答え合わせ済みです。");
        }
        let answerObjForTest = {
            _id:currentUser._id,
            usePoint:reqObj.usePoint,
            isFlag:reqObj.isFlag,
        }
        let answerObjForUser = {
            _id:foundTest._id,
            title:foundTest.title,
            isFlag:reqObj.isFlag,
        }

        let isFlagged = currentUser.isFlagged(foundTest._id);
        if(!isFlagged){
            console.log("還可以插旗");
        }else{
            console.log("不能再插旗");
            answerObjForTest.isFlag = false;
            answerObjForUser.isFlag = true;
        }

        let isMax = currentUser.isMax(foundTest._id);
        if(isMax){
            return res.status(400).send("予知回数が上限に達しています。");
        }

        if(reqObj.usePoint>currentUser.predictionPoints){
            return res.status(400).send(`所持ポイントが足りません。\n現在の所持ポイントは：${currentUser.predictionPoints}`);
        }

        let validChoices = foundTest.canBePredictedChoices(currentUser._id);
        console.log(`只能從${validChoices}之中選擇`);

        //進行預知時，對每個選項的answerer陣列搜尋內部是否有當前使用者的id，
        //若有的話代表使用者已經選擇過此選項，因此前端要根據這邊的資料改變樣式
        
        //不管玩家選什麼選項，User模型中的predictedSum都要+1，
        //且根據reqObj中的isFlag值來判斷要不要改變User模型中的isFlag

        let savedTest;
        // console.log(req.body)

        for(let key in reqObj){
            if((key == "one"||key == "two"||key=="three"||key=="four"||key=="five"||key=="six"||key=="seven"||key=="eight")&& reqObj[key] != ""){
                // console.log(`玩家選的選項是：${reqObj[key]}`);
                if(validChoices.includes(key)){
                    if(currentUser.isPredicted(foundTest._id)){
                        //這裡要儲存answerObjForUser的isFlag
                        currentUser.setFlag(foundTest._id,answerObjForUser.isFlag);
                        //若有預知過這題的話，只有次數+1
                        currentUser.predictSumInc(foundTest._id);

                    }else{
                        //console.log(currentUser.isPredicted(foundTest._id))
                        //若還沒預知過這題的話，先儲存新紀錄再次數+1
                        // console.log("還沒預知過");
                        currentUser.predictRecord.push(answerObjForUser);
                        currentUser.predictSumInc(foundTest._id);
                    }

                    let point = currentUser.predictionPoints - reqObj.usePoint;
                    let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
                        new:true,
                    });
                    let exp = currentUser.exp + 50;
                    let savedExp = await User.findOneAndUpdate({_id:currentUser._id},{exp:exp},{
                        new:true,
                    });

                    foundTest.choices[key].answerer.push(answerObjForTest);
                    savedTest = await foundTest.save();
                    return res.send({
                        msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。現在の獲得経験値は${savedExp.exp}です。`,
                        savedTest
                    });
                }else{
                    return res.status(400).send("無効な選択肢です。");
                }
            }
            // switch (key){
            //     case "one":
            //         console.log(`玩家選的選項是：①${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 //若有預知過這題的話，只有次數+1
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 //console.log(currentUser.isPredicted(foundTest._id))
            //                 //若還沒預知過這題的話，先儲存新紀錄再次數+1
            //                 // console.log("還沒預知過");
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }

            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             let exp = currentUser.exp + 50;
            //             let savedExp = await User.findOneAndUpdate({_id:currentUser._id},{exp:exp},{
            //                 new:true,
            //             });

            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。現在の獲得経験値は${savedExp.exp}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "two":
            //         console.log(`玩家選的選項是：②${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });

            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "three":
            //         console.log(`玩家選的選項是：③${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "four":
            //         console.log(`玩家選的選項是：④${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "five":
            //         console.log(`玩家選的選項是：⑤${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "six":
            //         console.log(`玩家選的選項是：⑥${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "seven":
            //         console.log(`玩家選的選項是：⑦${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            //     case "eight":
            //         console.log(`玩家選的選項是：⑧${reqObj[key]}`);
            //         if(validChoices.includes(key)){
            //             if(currentUser.isPredicted(foundTest._id)){
            //                 currentUser.predictSumInc(foundTest._id);
            //             }else{
            //                 currentUser.predictRecord.push(answerObjForUser);
            //                 currentUser.predictSumInc(foundTest._id);
            //             }
            //             let point = currentUser.predictionPoints - reqObj.usePoint;
            //             let savedPoint = await User.findOneAndUpdate({_id:currentUser._id},{predictionPoints:point},{
            //                 new:true,
            //             });
            //             foundTest.choices[key].answerer.push(answerObjForTest);
            //             savedTest = await foundTest.save();
            //             return res.send({
            //                 msg:`予知に成功しました！現在の所持ポイントは${savedPoint.predictionPoints}です。`,
            //                 savedTest
            //             });
            //         }else{
            //             return res.status(400).send("無効な選択肢です。");
            //             break;
            //         }
            // }
        }        
    }catch(e){
        console.log(e);
    }
});

//テストを編集するための関数
class EditTest {
    constructor() {
        this.choices = {};
        this.choices.one = { des: "" };
        this.choices.two = { des: "" };
        this.choices.three = { des: "" };
        this.choices.four = { des: "" };
        this.choices.five = { des: "" };
        this.choices.six = { des: "" };
        this.choices.seven = { des: "" };
        this.choices.eight = { des: "" };
    }
    setProperty(key, value) {
      if (key != "one" && key != "two"&& key != "three"&& key != "four"&& key != "five"&& key != "six"&& key != "seven"&& key != "eight") {
        //選択肢以外のテキストを編集する場合
        this[key] = value;
      } else {
        //選択肢を編集する場合
        // switch (key){
        //     case "one":
        //         this.choices.one.des = `①：${value}`;
        //         break;
        //     case "two":
        //         this.choices.two.des = `②：${value}`;
        //         break;
        //     case "three":
        //         this.choices.three.des = `③：${value}`;
        //         break;
        //     case "four":
        //         this.choices.four.des = `④：${value}`;
        //         break;
        //     case "five":
        //         this.choices.five.des = `⑤：${value}`;
        //         break;
        //     case "six":
        //         this.choices.six.des = `⑥：${value}`;
        //         break;
        //     case "seven":
        //         this.choices.seven.des = `⑦：${value}`;
        //         break;
        //     case "eight":
        //         this.choices.eight.des = `⑧：${value}`;
        //         break;
        //     //keyがone~eightのうちの一つであれば、
        //     //「answer」のプロパティに答えの内容をvalueに入れる

        //     //もっと賢いやり方があると思うけどわたしにはこのやり方しか思いつきません
        //     //てへぺりんこ！
        // }
        this.choices[key].des = value;
      }
    }
  }

//答え合わせをするための関数
class CheckOutTheAnswer{
    constructor(){}
        setProperty(key,value){
            //答え合わせを行うにはdescriptionを入力する必要がある
            if(key == "description"){
                if(!value){
                    window.alert("答え合わせを行うには説明を書く必要があります。");
                }
                this[`description`] = value;
            }
        }
        setStatus(){
            this[`isAccepting`] = false;
            this[`isWaitingForAnswering`] = false;
            this[`isAnswered`] = true;
        }
        setAnswer(key,value){
            switch (key){
                case "one":
                    this[`answer`] = `①：${value}`;
                    break;
                case "two":
                    this[`answer`] = `②：${value}`;
                    break;
                case "three":
                    this[`answer`] = `③：${value}`;
                    break;
                case "four":
                    this[`answer`] = `④：${value}`;
                    break;
                case "five":
                    this[`answer`] = `⑤：${value}`;
                    break;
                case "six":
                    this[`answer`] = `⑥：${value}`;
                    break;
                case "seven":
                    this[`answer`] = `⑦：${value}`;
                    break;
                case "eight":
                    this[`answer`] = `⑧：${value}`;
                    break;
                //keyがone~eightのうちの一つであれば、
                //「answer」のプロパティに答えの内容をvalueに入れる

                //もっと賢いやり方があると思うけどわたしにはこのやり方しか思いつきません
                //てへぺりんこ！
            }
            if(!value){
                window.alert("答え合わせを行うには正解を書く必要があります。");
            }
        }
}

//毎日0時にテストが締め切りになったかどうかを判断するための関数
//この関数を毎日0時に執行するようにセットする
//cronパッケージ
const isOverdue = new cron.CronJob("3 0 0 * * *",async function(){
    //要注意：*の間の半角スペースを忘れないように
    //左から"秒　分　時　日　月　曜日"
    //つまり毎日0時に関数を実行したい場合は、
    //"0 0 0 * * *"と入力
    //今はテスト段階なので仮の時間を入れておく

    //現在時刻が設置された答え合わせ日時を過ぎていたら
    //テストのステータスを「答え合わせ待ち」にする

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
    
},"Asia/Tokyo");
//タイムゾーンを日本に設定
//各パラメーターの意味はnpmjsのドキュメント、あるいは
//https://ithelp.ithome.com.tw/articles/10249462を参照

isOverdue.start();
//上の関数を実行する

const penaltyReset = new cron.CronJob("3 0 0 1 * *",async function(){
    //左から"秒　分　時　日　月　曜日"
    let nowTimeObj = new Date();
    let allUser = await User.find({}).exec();
    allUser.map(async user =>{
        console.log(`重置玩家${user._id}的懲罰回數`);
        await User.findOneAndUpdate({_id:user._id},{penaltyCount:0},{new:true}).exec();
        console.log(`已重置玩家${user._id}的懲罰回數`);
    })
},"Asia/Tokyo");

penaltyReset.start();

const isPenaltyEnd = new cron.CronJob("3 0 0 * * *",async function(){
    //左から"秒　分　時　日　月　曜日"
    let nowTimeObj = new Date();
    let allUser = await User.find({isPenalized:true}).exec();

    allUser.map(async user =>{
        console.log(`玩家${user._id}的懲罰期間是${user.penaltyEnd}`)
        if((nowTimeObj > user.penaltyEnd || nowTimeObj == user.penaltyEnd ) && (user.isPenalized == true)){
            console.log(`玩家${user._id}的懲罰期間已過`);
            await User.findOneAndUpdate({_id:user._id},{isPenalized:false,penaltyCount:0},{new:true});
            console.log(`已更新玩家${user._id}的懲罰狀態`);
        }
    })
},"Asia/Tokyo");

isPenaltyEnd.start();

//特定のテストを編集する
app.patch("/PredictionTests/:_id",requiredAuth,async(req,res)=>{
    let {_id} = req.params;
    
    try{
        //テストが存在しているかどうかを確かめる
        let foundTest = await PredictionTest.findOne({_id}).exec();
        if (!foundTest){
            return res.status(404).send("このテストは存在していません。");
        }
        // console.log(req.body)
        // 出題者のみが編集できる
        if(foundTest.publisher.equals(req.user._id)){
            let newObject = new EditTest();
            
            for (let property in req.body){
                newObject.setProperty(property, req.body[property]);
            }
            console.log(newObject)
            let editTest = await PredictionTest.findByIdAndUpdate({_id},newObject,{
                new:true,
            });
            return res.send({
                msg:"テストの編集に成功しました。",
                updatedData:editTest,
            });
        }else{
            return res.status(403).send("テストを編集できるのは出題者のみです。");
        }


    }catch(e){
        return res.status(400).send(e.message);
    }
});

//特定のテストに答え合わせを行う
app.patch("*/CheckOutTheAnswer/:_id",requiredAuth,async(req,res)=>{
    //答え合わせはつまりテストのstatus＆description＆answerを「変える」ことなのでPATCHを使う
    let {_id} = req.params;
    //CheckOutTheAnswer/:_idに選択肢を含んだPATCHリクエストを送れば
    //その選択肢が正解となる
    try{
        
        //テストが存在しているかどうかを確かめる
        let foundTest = await PredictionTest.findOne({_id}).exec();
        if (!foundTest){
            return res.status(404).send("このテストは存在していません。");
        }

        //測試階段先不要有此限制
        //出題者のみが答え合わせできる
        // if(!foundTest.publisher.equals(req.user._id)){
        //     return res.status(403).send("答え合わせを行えるのは出題者のみです。");
        // }

        //テストが答え合わせ待ち状態であるかどうかを確かめる
        //「答え合わせ待ち」のテストのみが答え合わせを行える
        if (foundTest.isAccepting){
            return res.send("このテストはまだ回答受付中です。");
        }else if(foundTest.isAnswered){
            return res.send("このテストはすでに答え合わせ済みです。");
        }
        let ANSWER = "";
        let correctAnswerer = [];
        let willBeSetAccuracyUser;
        let allPoints = 0;
        let awardPoints = 0;
        let awardForPub = 0;
        let awardExp = 200;
        let newObject = new CheckOutTheAnswer();
        for (let property in req.body){
            //req.bodyにはdescriptionと選択肢が入ってる
            newObject.setAnswer(property,req.body[property]);
            //Schemaで予め「answer」プロパティを作って、空っぽの文字列を入れて、
            //答え合わせを行う際にユーザーがちゃんと正解を書いたかどうかをチェックする
            newObject.setProperty(property, req.body[property]);
            newObject.setStatus();
            if((property=="one"||property=="two"||property=="three"||property=="four"||property=="five"||property=="six"||property=="seven"||property=="eight")&& req.body[property]!= ""){
                ANSWER = property;
            }
        }
        let newData = await PredictionTest.findByIdAndUpdate({_id},newObject,{
                new:true,
                runValidators:true,
        });
        let bonus = newData.bonus;
        for (let choice in newData.choices){
            if(newData.choices.hasOwnProperty(choice)){
                newData.choices[choice].answerer.map(user=>{
                    allPoints+=user.usePoint;
                })
                if(choice == ANSWER){
                    correctAnswerer = newData.choices[choice].answerer;
                    //正解に入れたプレイヤーの「ID]と「投入したポイント」と「旗立てたどうか」の情報が入ってる

                }
            }
        }
        // console.log(correctAnswerer)
        correctAnswerer.map(async user =>{
            //這裡新增讓使用者的答題記錄可以儲存該題是否有答對的功能
            //模仿user模型中setFlag的寫法?
            if(user.isFlag){
                awardPoints = (bonus + user.usePoint)*5*2;
                awardExp = awardExp*2;
                console.log(`玩家${user._id}可獲得${awardPoints}的點數和${awardExp}經驗值。`)
            }else{
                awardPoints = (bonus + user.usePoint)*5;
                console.log(`玩家${user._id}可獲得${awardPoints}的點數和${awardExp}經驗值。`)
            }
            willBeSetAccuracyUser = await User.findOne({_id:user._id}).exec();
            // console.log("答對的人的email："+willBeSetAccuracyUser.email)
            willBeSetAccuracyUser.setAccuracy(foundTest._id);
            User.findOneAndUpdate({_id:user._id},{$inc:{predictionPoints:awardPoints,exp:awardExp,accuracySum:1}},{new:true}).exec(function(err,result){
                if(err){
                    console.log(err);
                }else{
                    console.log("玩家資料更新成功")
                }
            });
            
        });
            awardForPub = Math.ceil(bonus*7+allPoints*0.5);
            console.log(`出題者${req.user._id}可獲得${awardForPub}的點數和400經驗值。`)
            User.findOneAndUpdate({_id:req.user._id},{$inc:{predictionPoints:awardForPub,exp:400}},{new:true}).exec(function(err,result){
            if(err){
                console.log(err);
            }else{
                console.log("更新成功")
            }
            //在使用者的答題記錄儲存該題是否有答對
        });

        //通知所有答題者

        let allAnswerer = [];
        for(let choice in foundTest.choices){
            if(foundTest.choices.hasOwnProperty(choice)){
                foundTest.choices[choice].answerer.map(user =>{
                    allAnswerer.push(user);
                })
                
            }
        }
        const filteredAnswerer = allAnswerer.filter((item, index, arr) => {
            // 找出第一個相同_id的物件並保留，過濾掉其他相同_id的物件
            return arr.findIndex(t => t._id.toString() == item._id.toString()) === index;
          });
        console.log(filteredAnswerer)
        const transporter = nodemailer.createTransport({
            service:"Gmail",
            auth:{
                user:GMAIL,
                pass:GMAIL_PASSWORD,
            }
        });

        filteredAnswerer.map(async user=>{
            let answerer = await User.findOne({_id:user._id}).exec();
            console.log("答題者的email："+answerer.email);
            const mailOptions = {
                from:GMAIL,
                to:answerer.email,
                subject:`予言テスト：${foundTest.title}の答え合わせが来ています。`,
                html:`先日予知していたテストの答え合わせが行われました。<br /><a href="http://localhost:3000/PredictionTests/${foundTest._id}">結果はこちらへ</a>`,
            }
            transporter.sendMail(mailOptions,function(err,info){
                if(err){
                    console.log("通知郵件傳送失敗")
                    console.log(err);
                }else{
                    console.log("通知郵件傳送成功")
                    console.log(info);
                }
            })
        })

        return res.send({
            msg:"答え合わせに成功しました。",
            updatedData:newData,
        });
    }catch(e){
        return res.status(400).send(e.message);
    }
});

//編集・答え合わせのRouteは後からアカウント認証機能を追加
//modelsディクトリーにuser.jsを追加
//出題者本人のみが編集・答え合わせを行える

//特定のテストを取り下げる
app.delete("/PredictionTests/:_id",requiredAuth, async(req,res)=>{
    try{
        let {_id} = req.params;
        //テストが存在しているかどうかを確かめる

        let foundTest = await PredictionTest.findOne({_id});
        if (!foundTest){
            return res.status(404).send("このテストは存在していません。");
        }

        //答え合わせ済みのテストは取り下げできない
        if(foundTest.isAnswered){
            return res.status(400).send("答え合わせ済みのテストは取り下げできません。");
        }

        //ペナルティ期間中のユーザーは取り下げできない
        if(req.user.isPenalized){
            return res.status(403).send("ペナルティ期間中のユーザーは取り下げを行えません。");
        }

        //出題者のみが取り下げできる
        // if(foundTest.publisher.equals(req.user._id)){
        //     await PredictionTest.deleteOne({_id});
        //     return res.send({
        //         msg:"テストが取り下げられました。",    
        //         });
        // }else{
        //     return res.status(403).send("取り下げを行えるのは出題者のみです。");
        // }

        let allAnswerer = [];
        for(let choice in foundTest.choices){
            if(foundTest.choices.hasOwnProperty(choice)){
                foundTest.choices[choice].answerer.map(user =>{
                    allAnswerer.push(user);
                })
                
            }
        }
        //投入されたポイントをプレイヤーに返す
        allAnswerer.map(async user =>{
            console.log(`把${user.usePoint}點數還給玩家${user._id}`)
            await User.findOneAndUpdate({_id:user._id},{$inc:{predictionPoints:user.usePoint}},{new:true}).exec();
        });

        // ペナルティ回数が+1
        let savedUser = await User.findOneAndUpdate({_id:req.user._id},{$inc:{penaltyCount:1}},{new:true}).exec();

        //ペナルティ回数が3になったらisPenalizedがtrueになる
        //這邊的+的時間之後調整
        //60*10*1000是10分鐘
        if(savedUser.penaltyCount >= 3){
            savedUser = await User.findOneAndUpdate({_id:req.user._id},{isPenalized:true,penaltyEnd:new Date(Date.now()+1000*60*60*24*10)},{new:true}).exec();
        }
        // console.log(allAnswerer)
        const filteredAnswerer = allAnswerer.filter((item, index, arr) => {
            // 找出第一個相同_id的物件並保留，過濾掉其他相同_id的物件
            return arr.findIndex(t => t._id.toString() == item._id.toString()) === index;
          });
        console.log(filteredAnswerer)
        filteredAnswerer.map(async user =>{
            let userDelete = await User.findOne({_id:user._id}).exec();
            userDelete.deleteRecord(foundTest._id);
        })
        await PredictionTest.deleteOne({_id});
        return res.send({
            msg:"テストが取り下げられました。",
            savedUser,    
            });
        //在題目被刪除後，出題者的模型中的紀錄中存入的題目_id會變成null
        //而對答題者來說則是isExist會變成false


    }catch(e){
        console.log(e);
        return res.status(400).send("テストの取り下げが失敗しました。");
        //初期用來測試的題目沒有publisher欄位，所以無法刪除是正常現象
    }
})










//サーバーを立ち上げる
app.listen(8080, () => {
    console.log("サーバーがポート8080で稼働しています。");
  });