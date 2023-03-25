const mongoose = require("mongoose");
const {Schema} = mongoose;

const newsSchema = new Schema({
  title:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  postDate:{
    type:Date,
    default:Date.now,
  },
});

const News = mongoose.model("News",newsSchema);
module.exports = News;