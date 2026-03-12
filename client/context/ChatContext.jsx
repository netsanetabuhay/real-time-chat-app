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

    // Get all users for sidebar
    const getUsers = useCallback(async () => {
        console.log("getUsers called");
        try {
            const { data } = await axios.get("/api/messages/users");
            console.log("getUsers response:", data);
            
            if (data.success) {
                // Check if current user is in the users list
                const currentUser = authUser;
                const userExists = data.users.some(user => user._id === currentUser?._id);
                console.log("Current user in list?", userExists);
                
                // If current user is not in the list, add them
                if (currentUser && !userExists) {
                    console.log("Adding current user to list");
                    setUsers([currentUser, ...data.users]);
                } else {
                    setUsers(data.users);
                }
                
                setUnSeenMessag(data.unSeenMessage);
            }
        } catch (error) {
            console.error("getUsers error:", error);
            toast.error(error.message);
        }
    }, [axios, authUser]);

// Get messages for selected user
const getMessages = useCallback(async (userId) => {
    console.log(`getMessages called for userId: ${userId}`);
    try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        console.log("getMessages response:", data);
        
        if (data.success) {
            console.log(`Setting ${data.messages.length} messages`);
            setMessage(data.messages);
            
            // Clear unread count for this user
            setUnSeenMessag(prev => ({
                ...prev,
                [userId]: 0
            }));
            
            return data.messages; // Return messages for use in RightSideBar
        }
    } catch (error) {
        console.error("getMessages error:", error);
        toast.error(error.message);
    }
}, [axios]);

    // Send message to selected user - WITH IMAGE SUPPORT
const sendMessag = useCallback(async (messageData) => {
    console.log("sendMessag received:", messageData);
    
    const receiverId = messageData?.receiverId;
    
    if (!receiverId) {
        toast.error("No user selected");
        return;
    }
    
    if (authUser?._id === receiverId) {
        toast.error("Cannot send message to yourself");
        return;
    }
    
    try {
        const backendPayload = {
            sendrId: authUser?._id,
            receiverId: receiverId,
            message: messageData.text || "",
            text: messageData.text || "",
            image: messageData.image || null  // Add image to payload
        };
        
        console.log("Sending to backend:", backendPayload);
        
        const { data } = await axios.post(`/api/messages/send/${receiverId}`, backendPayload);
        
        if (data.success) {
            setMessage((prevMessage) => [
                ...prevMessage,
                data.message
            ]);
            // toast.success("Message sent");
        } else {
            toast.error(data.message || "Failed to send message");
        }
    } catch (error) {
        console.error("API call error:", error);
        toast.error(error.response?.data?.message || error.message);
    }
}, [axios, authUser]);

    // Subscribe to messages
    const subscribeToMessages = useCallback((newMessage) => {
        console.log("New message received via socket:", newMessage);
        
        if (!newMessage) return;

        // Check if message is for currently selected user
        if (selectedUser && (newMessage.sendrId === selectedUser._id || newMessage.senderId === selectedUser._id)) {
            console.log("Message is for current chat");
            const updatedMessage = { ...newMessage, seen: true };
            setMessage((prevMessage) => [...prevMessage, updatedMessage]);

            axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                console.error("Failed to mark message as seen:", error);
            });
            
            // Clear unread count for this user
            setUnSeenMessag((prev) => ({
                ...prev,
                [newMessage.sendrId]: 0
            }));
        } else {
            console.log("Message from other user, updating unSeen count");
            const senderId = newMessage.sendrId || newMessage.senderId;
            setUnSeenMessag((prevUnseenMessages) => ({
                ...prevUnseenMessages,
                [senderId]: prevUnseenMessages[senderId] ? prevUnseenMessages[senderId] + 1 : 1
            }));
        }
    }, [selectedUser, axios]);

    // Unsubscribe from messages
    const unsubscribeFromMessages = useCallback(() => {
        console.log("Unsubscribing from messages");
        if (socket) {
            socket.off('newMessage', subscribeToMessages);
        }
    }, [socket, subscribeToMessages]);

    // Socket subscription effect
    useEffect(() => {
        console.log("Socket effect running. Socket exists:", !!socket);
        if (socket) {
            console.log("Setting up socket listener");
            socket.on('newMessage', subscribeToMessages);
        }

        return () => unsubscribeFromMessages();
    }, [socket, subscribeToMessages, unsubscribeFromMessages]);

    // Fetch messages when selected user changes
    useEffect(() => {
        console.log("Selected user changed:", selectedUser);
        const fetchMessages = async () => {
            if (selectedUser?._id) {
                console.log(`Fetching messages for user: ${selectedUser._id}`);
                await getMessages(selectedUser._id);
                
                // Clear unread count for selected user
                setUnSeenMessag((prev) => ({
                    ...prev,
                    [selectedUser._id]: 0
                }));
            } else {
                console.log("No user selected, clearing messages");
                setMessage([]);
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