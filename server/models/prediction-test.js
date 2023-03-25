const mongoose = require("mongoose");
const {Schema} = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

//テスト番号を振り分けるためのパッケージ
const AutoIncrement = require("mongoose-sequence")(mongoose);

//データベースでは時間はUTCの形式で保存される
//どのタイムゾーンで表示するかはフロントエンドで決めればいい

const predictionTestSchema = new Schema({
    title:{
        type:String,
        required:true,
        minlength:8,
    },
    genre:{
        type:String,
        enum:["グルメ","芸能","時事・トレンド","スポーツ","アニメ・ゲーム","政治経済","趣味・雑学","ノンジャンル",],
        //フロントエンドでラジオボタンにする？
    },
    description:{
        type:String,
        default:"",
    },
    answer:{
        type:String,
        default:"",
    },
    postDate:{
        type:Date,
        default:Date.now,
        //テスト作成した瞬間の日時を記録する
        //フロントエンドでこの文字列をDate()に入れて出力する
    },
    deadline:{
        type:Date,
        required:true,

        max:new Date(Date.now()+3*30*24*60*60*1000),
        //締め切りは最大「現在時刻の90日後」
    },
    choices:{
        //選択肢は最低五つ、最大八つ
        one:{
            des:{
                type:String,
                required:true,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
                //每個選項都有一個answerer陣列，
                //陣列中每個物件都分別代表不同玩家的
                //「玩家id(_id)」和「該玩家所投入的點數(usePoint)」和「是否插旗(isFlag)」
            ],
            //各選択肢に入れたユーザーのidと投資したポイントを記録
        },
        two:{
            des:{
                type:String,
                required:true,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
        three:{
            des:{
                type:String,
                required:true,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
        four:{
            des:{
                type:String,
                required:true,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
        five:{
            des:{
                type:String,
                required:true,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
        six:{
            des:{
                type:String,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
            
        },
        seven:{
            des:{
                type:String,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
        eight:{
            des:{
                type:String,
            },
            answerer:[
                {
                    _id:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        
                    },
                    usePoint:{
                        type:Number,
                    },
                    isFlag:{
                        type:Boolean,
                        default:false,
                        required:true,
                    },
                }
            ],
        },
    },
    //テストの状態
    //①isAccepting　→　②isWaitingForAnswering　→　③isAnswered
    isAccepting:{
        type:Boolean,
        default:true,
    },
    isWaitingForAnswering:{
        type:Boolean,
        default:false,
    },
    isAnswered:{
        type:Boolean,
        default:false,
    },
    //ここに出題者のアカウントをObject.idとrefで記入
    publisher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    bonus:{
        type:Number,
        required:true,
        min:20,
        //max:100,
        //minとmaxは要審議
        //こちらは基礎ポイントとなり、出題者の所持ポイントから引かれる
    }
});



predictionTestSchema.plugin(AutoIncrement, {inc_field:"test_ID"});

//ページング用
predictionTestSchema.plugin(mongoosePaginate);
const pagingOpts = {
    page:1,
    limit:10,
    populate: { path: 'publisher', select: 'nickname' },
}

predictionTestSchema.methods.canBePredictedChoices = function(UserID){
    let validChoices = [];
    for(let key in this.choices){
        if(this.choices[key].answerer &&this.choices[key].des){
            let checkItValid = this.choices[key].answerer.some(user=>{
                return (user._id.toString() == UserID.toString());
            });
            if(!checkItValid){
                validChoices.push(key);
            }
            
        }
    }
    return validChoices;
}

const PredictionTest = mongoose.model("PredictionTest", predictionTestSchema);
module.exports = PredictionTest;

