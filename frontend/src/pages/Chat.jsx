import React, { useState, useContext, useEffect } from 'react';
import Nav from '../components/Nav';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import { userDataContext } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const { userData } = useContext(userDataContext);
    const { socket } = useSocket();
    const [newMessageAlert, setNewMessageAlert] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('newMessage', handleNewMessageNotification);
            
            return () => {
                socket.off('newMessage');
            };
        }
    }, [socket, selectedChat]);

    const handleNewMessageNotification = (data) => {
        // If we're not currently viewing this chat, show notification
        if (!selectedChat || data.chatId !== selectedChat._id) {
            setNewMessageAlert(data);
            
            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
                const sender = data.message.sender;
                new Notification('New message from ConnectU', {
                    body: `${sender.firstName} ${sender.lastName}: ${data.message.content}`,
                    icon: sender.profileImage || '/logo.png'
                });
            }
        }
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setNewMessageAlert(null);
        
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    };

    const handleShowSidebar = () => {
        setShowSidebar(true);
    };

    // Request notification permission on component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            <div className="flex h-[calc(100vh-80px)]">
                {/* Mobile toggle button */}
                {!showSidebar && (
                    <button
                        onClick={handleShowSidebar}
                        className="md:hidden fixed top-20 left-4 z-10 bg-blue-600 text-white p-2 rounded-full shadow-lg"
                    >
                        💬
                        {newMessageAlert && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                )}

                {/* Chat Sidebar */}
                <div className={`${showSidebar ? 'block' : 'hidden'} md:block`}>
                    <ChatSidebar
                        selectedChat={selectedChat}
                        onChatSelect={handleChatSelect}
                        onClose={handleCloseSidebar}
                    />
                </div>

                {/* Chat Window */}
                <ChatWindow
                    chat={selectedChat}
                    currentUser={userData}
                />
            </div>
        </div>
    );
};

export default Chat;