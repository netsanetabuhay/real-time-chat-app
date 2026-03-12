/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [message, setMessage] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unSeenMessage, setUnSeenMessag] = useState({});
    const { socket, axios } = useContext(AuthContext);

    //function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnSeenMessag(data.unSeenMessage);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessage(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //function to send message to selected user
    const sendMessag = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser?._id}`, messageData);

            if (data.success && selectedUser) {
                setMessage((prevMessage) => [
                    ...prevMessage, 
                    data.newMessage
                ]);
            } else {
                toast.error(data.message || "Failed to send message");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //function to subscribe to messages for selected user
    const subscribeToMessages = useCallback((newMessage) => {
        if (!newMessage) return;
        
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            // FIXED: Don't mutate the parameter directly
            const updatedMessage = { ...newMessage, seen: true };
            setMessage((prevMessage) => [...prevMessage, updatedMessage]);
            
            // FIXED: Added toast error for user feedback
            axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                console.error("Failed to mark message as seen:", error);
                toast.error("Failed to mark message as seen");
            });
        } else {
            setUnSeenMessag((prevUnseenMessages) => ({
                ...prevUnseenMessages,
                [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
            }));
        }
    }, [selectedUser, axios]);  // Added dependencies

    //function to unsubscribe
    const unsubscribeFromMessages = useCallback(() => {
        if (socket) {
            socket.off('newMessage', subscribeToMessages);
        }
    }, [socket, subscribeToMessages]);  // Added dependencies

    useEffect(() => {
        if (socket) {
            socket.on('newMessage', subscribeToMessages);
        }
        
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser, subscribeToMessages, unsubscribeFromMessages]);

    const value = {
        message,
        users,
        selectedUser,
        getUsers,
        getMessages,
        setMessage,
        sendMessag,
        setSelectedUser,
        unSeenMessage,
        setUnSeenMessag
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};