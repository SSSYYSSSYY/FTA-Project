const mongoose = require("mongoose");
const {Schema} = mongoose;
const bcrypt = require("bcryptjs");
const { User } = require(".");

const userSchema = new Schema({
    isAdmin:{
        type:Boolean,
        default:false,
    },
    nickname:{
        type:String,
        required:true,
        minlength:2,
        maxlength:10,
    },
    exp:{
        type:Number,
        default:0,
    },
    expForNextLevel:{
        type:Number,
    },
    level:{
        type:Number,
        default:1,
    },
    username:{
        type:String,
        required:true,
        minlength:5,
        maxlength:50,
    },
    password:{
        type:String,
        required:true,
        minlength:5,
    },
    email:{
        type:String,
        required:true,
    },
    createdDate:{
        type:Date,
        default:Date.now,
    },
    predictionPoints:{
        type:Number,
        default:500,//暫定初始持有點數
    },
    predictRecord:[
        //予知記録
        //每個物件都代表一個題目
        {
            _id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"PredictionTest",
            },
            title:{
                type:String,
            },
            predictedSum:{
                type:Number,
                default:0,
            },
            isFlag:{
                type:Boolean,
                default:false,
            },
            isAccurate:{
                type:Boolean,
                default:false,
            },
            isExist:{
                type:Boolean,
                default:true,
            }
        }
    ],
    publishRecord:[
        //出題記録
        //每個物件都代表一個題目
        {
            _id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"PredictionTest",
            },
            title:{
                type:String,
            },
            isExist:{
                type:Boolean,
                default:true,
            }
        }
    ],
    penaltyCount:{
        type:Number,
        default:0,
    },
    isPenalized:{
        type:Boolean,
        default:false,
    },
    penaltyEnd:{
        type:Date,
        required:function(){
            return this.isPenalized;
        }
    },
    accuracySum:{
        type:Number,
        default:0,
    },
    
});

//bcryptパッケージでパスワードが正確であるかどうかをチェック
userSchema.methods.comparePassword = async function(password,cb){
    let result;
    try{
        result = await bcrypt.compare(password,this.password);
        return cb(null,result);
    }catch(e){
        return cb(e,result);
    }
}

userSchema.methods.predictSumInc =  function(TestID){
    const currentTestIndex = this.predictRecord.findIndex(record =>String(record._id)==String(TestID));
    if (currentTestIndex == -1){
        console.log("找不到資料")
    }
    this.predictRecord[currentTestIndex].predictedSum+=1;
    return this.save();
}

userSchema.methods.setFlag = function(TestID,Boolean){
    //這裡的布林值是代表玩家有沒有要插旗
    for (const record of this.predictRecord){
        if(record._id.toString() == TestID.toString()){
            record.isFlag = Boolean;

        }
    }
}

userSchema.methods.setAccuracy = function(TestID){
    for (const record of this.predictRecord){
        if(record._id.toString() == TestID.toString()){
            record.isAccurate = true;
            return this.save();
        }
    }
}

userSchema.methods.deleteRecord = function(TestID){
    for (const record of this.predictRecord){
        if(record && record._id && record._id.toString() == TestID.toString()){
            record.isExist = false;
        }
    }
    for (const record of this.publishRecord){
        if(record && record._id && record._id.toString() == TestID.toString()){
            record.isExist = false;
        }
    }
    return this.save();
}


userSchema.methods.isPredicted = function(TestID){
    const currentTestIndex = this.predictRecord.findIndex(record =>String(record._id)==String(TestID));
    return !(Number(currentTestIndex) === -1);
}

userSchema.methods.isFlagged = function(TestID){
    for (const record of this.predictRecord){
        if(record._id.toString() == TestID.toString()){
            return record.isFlag;
        }
    }
}

userSchema.methods.isMax = function(TestID){
    //一つのテストに対する予知上限に達しているかどうかを判断
    for (const record of this.predictRecord){
        if(record._id.toString() == TestID.toString()){
            return (Number(record.predictedSum)>=4);
        }
    }
}

userSchema.methods.expProgress = function() {
    const initialEXP = 100;
    const level = Math.floor((Math.sqrt(1 + 8 * this.exp / initialEXP) - 1) / 2);
    const currentLevelExp = Math.floor((level * (level + 1)) / 2 * initialEXP);
    const nextLevelExp = Math.floor(((level + 1) * (level + 2)) / 2 * initialEXP);
    const expNeededForNextLevel = nextLevelExp - currentLevelExp;
    const expProgress = (this.exp - currentLevelExp) / expNeededForNextLevel;
    return Math.round(expProgress * 100) / 100;
  }

userSchema.methods.expNeededForNextLevel = function(){
    const initialEXP = 100;
    const level = Math.floor((Math.sqrt(1 + 8 * this.exp / initialEXP) - 1) / 2);
    const nextLevelExp = Math.floor(((level + 1) * (level + 2)) / 2 * initialEXP);
    return nextLevelExp - this.exp;
}

userSchema.methods.calculateLevel = function(){
    const initialEXP = 100;
    const level = Math.floor((Math.sqrt(1 + 8 * this.exp / initialEXP) - 1) / 2);
    return level +1;
}

//ミドルウェア
userSchema.pre("save",async function(next){
    if (this.isNew||this.isModified("password")){
        const hashValue = await bcrypt.hash(this.password,10);
        this.password = hashValue;
    }
    next();
});

module.exports = mongoose.model("User",userSchema);