import mongoose from "mongoose"

const postSchema=new mongoose.Schema({
author:{
   type: mongoose.Schema.Types.ObjectId,
   ref:"User",
   required:true
},
description:{
    type:String,
    default:""
},
image:{
    type:String
},
category:{
    type:String,
    enum:["general", "jobs", "events", "memories", "achievements"],
    default:"general"
},
tags:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
}],
like:[
   {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
}
],
comment:[
    {
        content:{type:String},
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User" 
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
],
isPublic:{
    type:Boolean,
    default:true
}

},{timestamps:true})

const Post=mongoose.model("Post",postSchema)
export default Post