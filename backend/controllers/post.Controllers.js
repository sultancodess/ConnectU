import Post from "../models/post.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io } from "../index.js";
import Notification from "../models/notification.model.js";
export const createPost=async (req,res)=>{
    try {
        let {description, category = "general", tags = []} = req.body
        let newPost;
        
        // Parse tags if it's a string
        if (typeof tags === 'string') {
            tags = JSON.parse(tags);
        }
        
        if(req.file){
            let image=await uploadOnCloudinary(req.file.path)
            newPost=await Post.create({
                author:req.userId,
                description,
                image,
                category,
                tags
            })
        }else{
            newPost=await Post.create({
                author:req.userId,
                description,
                category,
                tags
            })
        }
        
        // Populate the new post before returning
        newPost = await Post.findById(newPost._id)
            .populate("author","firstName lastName profileImage headline userName")
            .populate("tags","firstName lastName profileImage userName")
            
        return res.status(201).json(newPost)

    } catch (error) {
        return res.status(500).json(`create post error ${error}`)
    }
}


export const getPost=async (req,res)=>{
    try {
        const { category, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        let filter = {};
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        const posts = await Post.find(filter)
            .populate("author","firstName lastName profileImage headline userName")
            .populate("tags","firstName lastName profileImage userName")
            .populate("comment.user","firstName lastName profileImage headline")
            .sort({createdAt:-1})
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const totalPosts = await Post.countDocuments(filter);
        
        return res.status(200).json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: page * limit < totalPosts
            }
        });
    } catch (error) {
        return res.status(500).json({message:"getPost error"})
    }
}

export const like =async (req,res)=>{
    try {
        let postId=req.params.id
        let userId=req.userId
        let post=await Post.findById(postId)
        if(!post){
            return res.status(400).json({message:"post not found"})
        }
        if(post.like.includes(userId)){
          post.like=post.like.filter((id)=>id!=userId)
        }else{
            post.like.push(userId)
            if(post.author!=userId){
                let notification=await Notification.create({
                    receiver:post.author,
                    type:"like",
                    relatedUser:userId,
                    relatedPost:postId
                })
            }
           
        }
        await post.save()
      io.emit("likeUpdated",{postId,likes:post.like})
       

     return  res.status(200).json(post)

    } catch (error) {
      return res.status(500).json({message:`like error ${error}`})  
    }
}

export const comment=async (req,res)=>{
    try {
        let postId=req.params.id
        let userId=req.userId
        let {content}=req.body

        let post=await Post.findByIdAndUpdate(postId,{
            $push:{comment:{content,user:userId}}
        },{new:true})
        .populate("comment.user","firstName lastName profileImage headline")
        if(post.author!=userId){
        let notification=await Notification.create({
            receiver:post.author,
            type:"comment",
            relatedUser:userId,
            relatedPost:postId
        })
    }
        io.emit("commentAdded",{postId,comm:post.comment})
        return res.status(200).json(post)

    } catch (error) {
        return res.status(500).json({message:`comment error ${error}`})  
    }
}