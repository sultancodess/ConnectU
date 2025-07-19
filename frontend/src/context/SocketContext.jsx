import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { userDataContext } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { userData } = useContext(userDataContext);

    useEffect(() => {
        if (userData) {
            const socketInstance = io('http://localhost:8000', {
                withCredentials: true
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket server');
                socketInstance.emit('register', userData._id);
            });

            socketInstance.on('userOnline', (userId) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            socketInstance.on('userOffline', (userId) => {
                setOnlineUsers(prev => {
                    const newSet = new Set([...prev]);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            socketInstance.on('onlineUsers', (users) => {
                setOnlineUsers(new Set(users));
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [userData]);

    const value = {
        socket,
        onlineUsers: Array.from(onlineUsers),
        isUserOnline: (userId) => onlineUsers.has(userId)
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;