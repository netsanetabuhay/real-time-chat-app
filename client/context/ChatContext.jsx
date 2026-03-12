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
            setMessage(data.messages); // Make sure it's data.messages not data.message
        }
    } catch (error) {
        console.error("getMessages error:", error);
        toast.error(error.message);
    }
}, [axios]);
// Send message to selected user - FIXED
const sendMessag = useCallback(async (messageData) => {
    console.log("========== SENDMESSAG DEBUG ==========");
    console.log("sendMessag received:", messageData);
    
    // Get receiverId from messageData
    const receiverId = messageData?.receiverId;
    
    if (!receiverId) {
        console.log("❌ No receiverId found in messageData");
        toast.error("No user selected");
        return;
    }
    
    // Prevent sending message to yourself
    if (authUser?._id === receiverId) {
        console.log("❌ Cannot send to self");
        toast.error("Cannot send message to yourself");
        return;
    }
    
    try {
        // Format data to match your Mongoose schema exactly
        const backendPayload = {
            sendrId: authUser?._id,        // MUST include this - your schema requires it
            receiverId: receiverId,
            message: messageData.text,      // Your schema requires 'message' field
            text: messageData.text,         // Optional text field
            image: null
        };
        
        console.log("Sending to backend:", backendPayload);
        console.log("To receiver ID:", receiverId);
        
        const { data } = await axios.post(`/api/messages/send/${receiverId}`, backendPayload);
        
        console.log("API response:", data);

        if (data.success) {
            console.log("Success, updating messages with new message:", data.message);
            setMessage((prevMessage) => [
                ...prevMessage,
                data.message
            ]);
            toast.success("Message sent");
        } else {
            console.log("Server error:", data.message);
            toast.error(data.message || "Failed to send message");
        }
    } catch (error) {
        console.error("API call error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        toast.error(error.response?.data?.message || error.message);
    }
    console.log("========== END SENDMESSAG DEBUG ==========");
}, [axios, authUser]);

    // Subscribe to messages
    const subscribeToMessages = useCallback((newMessage) => {
        console.log("New message received via socket:", newMessage);
        
        if (!newMessage) return;

        if (selectedUser && newMessage.senderId === selectedUser._id) {
            console.log("Message is for current chat");
            const updatedMessage = { ...newMessage, seen: true };
            setMessage((prevMessage) => [...prevMessage, updatedMessage]);

            axios.put(`/api/messages/mark/${newMessage._id}`).catch(error => {
                console.error("Failed to mark message as seen:", error);
            });
        } else {
            console.log("Message from other user, updating unSeen count");
            setUnSeenMessag((prevUnseenMessages) => ({
                ...prevUnseenMessages,
                [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
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