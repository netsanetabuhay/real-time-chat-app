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
    const { socket, axios, authUser } = useContext(AuthContext);

    // Get all users for sidebar - FIXED to include current user
    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                // Check if current user is in the users list
                const currentUser = authUser;
                const userExists = data.users.some(user => user._id === currentUser?._id);
                
                // If current user is not in the list, add them
                if (currentUser && !userExists) {
                    setUsers([currentUser, ...data.users]);
                } else {
                    setUsers(data.users);
                }
                
                setUnSeenMessag(data.unSeenMessage);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios, authUser]);

    // Get messages for selected user
    const getMessages = useCallback(async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessage(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios]);

    // Send message to selected user
    const sendMessag = useCallback(async (messageData) => {
        // Add check to prevent sending to self
        if (!selectedUser || !selectedUser._id) {
            toast.error("No user selected");
            return;
        }
        
        // Prevent sending message to yourself
        if (authUser?._id === selectedUser._id) {
            toast.error("Cannot send message to yourself");
            return;
        }
        
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

            if (data.success && selectedUser) {
                setMessage((prevMessage) => [
                    ...prevMessage,
                    data.newMessage
                ]);
            } else {
                toast.error(data.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Send message error:", error);
            toast.error(error.message);
        }
    }, [axios, selectedUser, authUser]);

    // Subscribe to messages
    const subscribeToMessages = useCallback((newMessage) => {
        if (!newMessage) return;

        if (selectedUser && newMessage.senderId === selectedUser._id) {
            const updatedMessage = { ...newMessage, seen: true };
            setMessage((prevMessage) => [...prevMessage, updatedMessage]);

            axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                console.error("Failed to mark message as seen:", error);
            });
        } else {
            setUnSeenMessag((prevUnseenMessages) => ({
                ...prevUnseenMessages,
                [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
            }));
        }
    }, [selectedUser, axios]);

    // Unsubscribe from messages
    const unsubscribeFromMessages = useCallback(() => {
        if (socket) {
            socket.off('newMessage', subscribeToMessages);
        }
    }, [socket, subscribeToMessages]);

    // Socket subscription effect
    useEffect(() => {
        if (socket) {
            socket.on('newMessage', subscribeToMessages);
        }

        return () => unsubscribeFromMessages();
    }, [socket, subscribeToMessages, unsubscribeFromMessages]);

    // Fetch messages when selected user changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUser?._id) {
                await getMessages(selectedUser._id);
            }
        };
        
        fetchMessages();
    }, [selectedUser, getMessages]);

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