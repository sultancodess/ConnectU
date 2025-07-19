import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ chat, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);
    const { socket, isUserOnline } = useSocket();

    const otherUser = chat?.participants?.find(p => p._id !== currentUser?._id);

    useEffect(() => {
        if (chat?._id) {
            fetchMessages();
            markMessagesAsRead();
        }
    }, [chat?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socket && chat?._id) {
            // Listen for new messages
            socket.on('newMessage', handleNewMessage);
            
            // Listen for typing indicators
            socket.on('userTyping', handleUserTyping);
            socket.on('userStoppedTyping', handleUserStoppedTyping);
            
            // Join chat room
            socket.emit('joinChat', chat._id);
            
            return () => {
                socket.off('newMessage');
                socket.off('userTyping');
                socket.off('userStoppedTyping');
                socket.emit('leaveChat', chat._id);
            };
        }
    }, [socket, chat?._id]);

    const handleNewMessage = (data) => {
        if (data.chatId === chat?._id) {
            setMessages(prev => [...prev, data.message]);
            markMessagesAsRead();
        }
    };

    const handleUserTyping = ({ chatId, userId }) => {
        if (chatId === chat?._id && userId !== currentUser?._id) {
            setIsTyping(true);
        }
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
        if (chatId === chat?._id && userId !== currentUser?._id) {
            setIsTyping(false);
        }
    };

    const handleTyping = () => {
        if (socket && chat?._id) {
            socket.emit('typing', { chatId: chat._id, userId: currentUser?._id });
            
            // Clear previous timeout
            if (typingTimeout) clearTimeout(typingTimeout);
            
            // Set new timeout
            const timeout = setTimeout(() => {
                socket.emit('stopTyping', { chatId: chat._id, userId: currentUser?._id });
            }, 2000);
            
            setTypingTimeout(timeout);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8000/api/chat/${chat._id}/messages`,
                { withCredentials: true }
            );
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await axios.patch(
                `http://localhost:8000/api/chat/${chat._id}/read`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post(
                `http://localhost:8000/api/chat/${chat._id}/messages`,
                { content: newMessage },
                { withCredentials: true }
            );
            
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            
            // Clear typing indicator
            if (socket) {
                socket.emit('stopTyping', { chatId: chat._id, userId: currentUser?._id });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">💬</div>
                    <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={otherUser?.profileImage || 'https://via.placeholder.com/40'}
                            alt={otherUser?.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {isUserOnline(otherUser?._id) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {otherUser?.firstName} {otherUser?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isUserOnline(otherUser?._id) ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div
                                key={message._id}
                                className={`flex ${
                                    message.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.sender._id === currentUser?._id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p className={`text-xs mt-1 ${
                                        message.sender._id === currentUser?._id
                                            ? 'text-blue-200'
                                            : 'text-gray-500'
                                    }`}>
                                        {moment(message.createdAt).format('HH:mm')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;