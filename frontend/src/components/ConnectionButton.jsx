import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import io from "socket.io-client"
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"
const socket=io("http://localhost:8000")
function ConnectionButton({userId}) {
let {serverUrl}=useContext(authDataContext)
let {userData,setUserData}=useContext(userDataContext)
let [status,setStatus]=useState("")
let navigate=useNavigate()
    const handleSendConnection=async ()=>{
        try {
            let result=await axios.post(`${serverUrl}/api/connection/send/${userId}`,{},{withCredentials:true})
            console.log(result)
            
        } catch (error) {
            console.log(error)
        }
    }
    const handleRemoveConnection=async ()=>{
        try {
            let result=await axios.delete(`${serverUrl}/api/connection/remove/${userId}`,{withCredentials:true})
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }
    const handleGetStatus=async ()=>{
        try {
            let result=await axios.get(`${serverUrl}/api/connection/getStatus/${userId}`,{withCredentials:true})
            console.log(result)
            setStatus(result.data.status)
            
        } catch (error) {
            console.log(error)
        }
    }

useEffect(()=>{
    socket.emit("register",userData._id)
    handleGetStatus()

    socket.on("statusUpdate",({updatedUserId,newStatus})=>{
if(updatedUserId==userId){
    setStatus(newStatus)
}
    })

    return ()=>{
        socket.off("statusUpdate")
    }

},[userId])

const handleClick=async ()=>{
    if(status=="disconnect"){
      await handleRemoveConnection()
    }else if(status=="received"){
        navigate("/network")
    }else{
await handleSendConnection()
    }
}

const handleStartChat = async () => {
    try {
        const response = await axios.get(`${serverUrl}/api/chat/user/${userId}`, {
            withCredentials: true
        });
        navigate('/chat');
    } catch (error) {
        console.log('Error starting chat:', error);
    }
}

  return (
    <div className='flex gap-2'>
        <button className='min-w-[100px] h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff]' onClick={handleClick} disabled={status=="pending"}>{status}</button>
        {status === "connected" && (
            <button 
                className='h-[40px] px-3 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 flex items-center gap-1' 
                onClick={handleStartChat}
                title="Start Chat"
            >
                <IoChatbubbleEllipsesOutline className='w-[18px] h-[18px]'/>
                <span className='hidden sm:inline'>Chat</span>
            </button>
        )}
    </div>
  )
}

export default ConnectionButton
