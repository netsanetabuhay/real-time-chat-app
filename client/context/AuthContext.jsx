/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);

    // Connect socket function
    const connectSocket = useCallback((userData) => {
        if (!userData || socket?.connected) return;
        
        try {
            const newSocket = io(backendUrl, {
                query: {
                    userId: userData._id,
                }
            });
            
            newSocket.connect();

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                toast.error("Connection error");
            });

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUser(userIds);
            });

            setSocket(newSocket);
        } catch (error) {
            console.error("Failed to connect socket:", error);
            toast.error("Failed to establish connection");
        }
    }, [socket]);

    // Check if user is authenticated
    const checkAuth = useCallback(async () => {
        try {
            const { data } = await axios.get("api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [connectSocket]);

    // Login function
    const login = useCallback(async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);

            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['Token'] = data.Token;
                setToken(data.Token);
                localStorage.setItem("token", data.Token);

                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Login error:", error.response?.data);
            toast.error(error.message);
        }
    }, [connectSocket]);

    // Logout function
    const logout = useCallback(async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
        }
    }, [socket]);

    // Update profile function
    const updateProfile = useCallback(async (body) => {
        try {
            const tokenToSend = token || localStorage.getItem("token");

            const { data } = await axios.put("/api/auth/update-profile", body, {
                headers: {
                    'token': tokenToSend
                }
            });

            if (data.success) {
                setAuthUser(data.user);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [token]);

    // useEffect with proper dependencies
    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                axios.defaults.headers.common["token"] = token;
                await checkAuth();
            }
        };
        
        verifyAuth();
    }, [token, checkAuth]);

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;