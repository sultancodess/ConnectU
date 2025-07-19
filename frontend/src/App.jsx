import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import { userDataContext } from './context/UserContext'
import Network from './pages/Network'
import Profile from './pages/Profile'
import Notification from './pages/Notification'
import Chat from './pages/Chat'
import Donations from './pages/Donations'
import MyDonations from './pages/MyDonations'
import AdminPanel from './pages/AdminPanel'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  let {userData}=useContext(userDataContext)
  return (
   <NotificationProvider>
    <SocketProvider>
     <Routes>
      <Route path='/' element={userData?<Home/>:<Navigate to="/login"/>}/>
      <Route path='/signup' element={userData?<Navigate to="/"/>:<Signup/>}/>
      <Route path='/login' element={userData?<Navigate to="/"/>:<Login/>}/>
      <Route path='/network' element={userData?<Network/>:<Navigate to="/login"/>}/>
      <Route path='/profile' element={userData?<Profile/>:<Navigate to="/login"/>}/>
      <Route path='/profile/:username' element={userData?<Profile/>:<Navigate to="/login"/>}/>
      <Route path='/notification' element={userData?<Notification/>:<Navigate to="/login"/>}/>
      <Route path='/chat' element={userData?<Chat/>:<Navigate to="/login"/>}/>
      <Route path='/donations' element={userData?<Donations/>:<Navigate to="/login"/>}/>
      <Route path='/my-donations' element={userData?<MyDonations/>:<Navigate to="/login"/>}/>
      <Route path='/admin' element={userData?.role === 'admin'?<AdminPanel/>:<Navigate to="/"/>}/>
     </Routes>
    </SocketProvider>
   </NotificationProvider>
  )
}

export default App
