import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useSocket } from '../context/SocketContext';
import { userDataContext } from '../context/userContext';

const ChatSidebar = ({ selectedChat, onChatSelect, onClose }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isUserOnline } = useSocket();
    const { userData } = useContext(userDataContext);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/chat', {
                withCredentials: true
            });
            setChats(response.data.chats);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOtherParticipant = (participants) => {
        const currentUserId = userData?._id;
        return participants.find(p => p._id !== currentUserId);
    };

    const getUnreadCount = (chat) => {
        if (!chat.lastMessage) return 0;
        
        const currentUserId = localStorage.getItem('userId');
        const readByUserIds = chat.lastMessage.readBy?.map(r => r.user) || [];
        
        if (chat.lastMessage.sender._id === currentUserId) return 0;
        if (readByUserIds.includes(currentUserId)) return 0;
        
        return 1; // In a real app, you'd count all unread messages
    };

    if (loading) {
        return (
            <div className="w-80 bg-white border-r border-gray-200 p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>No conversations yet</p>
                        <p className="text-sm mt-2">Connect with users to start chatting</p>
                    </div>
                ) : (
                    chats.map(chat => {
                        const otherUser = getOtherParticipant(chat.participants);
                        const unreadCount = getUnreadCount(chat);
                        const isOnline = isUserOnline(otherUser?._id);
                        
                        return (
                            <div
                                key={chat._id}
                                onClick={() => onChatSelect(chat)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={otherUser?.profileImage || 'https://via.placeholder.com/40'}
                                            alt={otherUser?.firstName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {otherUser?.firstName} {otherUser?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {chat.lastMessage?.content || 'Start a conversation'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs text-gray-400">
                                            {chat.lastMessageTime && moment(chat.lastMessageTime).format('HH:mm')}
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="mt-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-xs text-white">{unreadCount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;