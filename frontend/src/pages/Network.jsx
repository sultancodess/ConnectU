import React, { useContext, useEffect, useState } from 'react'
import Nav from '../components/Nav'
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import dp from "../assets/dp.webp"
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";

import io from "socket.io-client"

const socket=io("http://localhost:8000")
function Network() {
let {serverUrl}=useContext(authDataContext)
let [connections,setConnections]=useState([])
    const handleGetRequests=async ()=>{
        try {
            let result=await axios.get(`${serverUrl}/api/connection/requests`,{withCredentials:true})
            setConnections(result.data)
        } catch (error) {
           console.log(error) 
        }
    }
    const handleAcceptConnection=async (requestId)=>{
try {
    let result = await axios.put(`${serverUrl}/api/connection/accept/${requestId}`,{},{withCredentials:true})
    setConnections(connections.filter((con)=>con._id!=requestId))
} catch (error) {
    console.log(error)
}
    }
    const handleRejectConnection=async (requestId)=>{
        try {
            let result = await axios.put(`${serverUrl}/api/connection/reject/${requestId}`,{},{withCredentials:true})
            setConnections(connections.filter((con)=>con._id===requestId))
        } catch (error) {
            console.log(error)
        }
            }

            
    useEffect(()=>{
        handleGetRequests()
    },[])
  return (
    <div className='w-screen h-[100vh] bg-[#f0efe7] pt-[100px] px-[20px] flex flex-col items-center gap-[40px]'>
        <Nav/>
      <div className='w-full h-[100px] bg-[white] shadow-lg rounded-lg flex items-center p-[10px] text-[22px] text-gray-600'>
Invitations {connections.length}
      </div>

      {connections.length>0 &&  <div className='w-[100%] max-w-[900px]  bg-white shadow-lg rounded-lg flex flex-col gap-[20px] min-h-[100px]'>
    {connections.map((connection,index)=>(
        <div className='w-full min-h-[100px] p-[20px] flex justify-between items-center' key={index}>
          <div className='flex justify-center items-center gap-[10px]'>
<div className='w-[60px] h-[60px] rounded-full overflow-hidden cursor-pointer'>
            <img src={connection.sender.profileImage || dp} alt="" className='w-full h-full'/>
        </div>
        <div className='text-[19px] font-semibold text-gray-700'>{`${connection.sender.firstName} ${connection.sender.lastName}`}</div>
            </div>  
        <div className='flex justify-center items-center gap-[10px]'>
<button className='text-[#18c5ff] font-semibold' onClick={()=>handleAcceptConnection(connection._id)}>
<IoIosCheckmarkCircleOutline className='w-[40px] h-[40px]'/>
</button>
<button className='text-[#ff4218] font-semibold' onClick={()=>handleRejectConnection(connection._id)}>
<RxCrossCircled className='w-[36px] h-[36px]'/>
</button>
        </div> 
        </div>
    ))}
  </div>}
 

    </div>
  )
}

export default Network
