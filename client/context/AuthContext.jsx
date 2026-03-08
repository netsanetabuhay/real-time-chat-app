import React, { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import axios from 'axios';




const backendUrl= import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL=backendUrl;



export const AuthContext = createContext(); // eslint-disable-line

const AuthProvider = ({children}) => {

const [token, setToken] = useState(localStorage.getItem("token"));
const [authUser , setAuthUser] = useState(null)
const [onlineUser ,setOnlineUser] = useState([]);
const [socket , setSocket] = useState(null);

//check if user is authenticated and if so , set the user date and connect the socket

const checkAuth = async () => {
    try {
   const {data} =  await axios.get("api/auth/check");

         if(data.success){
            setAuthUser(data.user);
            connectSocket(data.user);
         }
        

    } catch (error) {
        toast.error(error.message);
        
    }

}


//login function to handle user authentication and socket connection

const login = async (state, credentials)=>{

    try {
        console.log("Sending credentials:", credentials);
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
       console.log("Response data:", data); // Add this


if(data.success){
    setAuthUser(data.userData);
    connectSocket(data.userData);
axios.defaults.headers.common['token'] = data.token; // eslint-disable-line
    setToken(data.token);
    localStorage.setItem("token", data.token);
    toast.success(data.message);

}
else{
    toast.error(data.message);
}
        
    } catch (error) {
     console.error("Login error:", error.response?.data); // Log the error response
        toast.error(error.message);
        
    }

}

//logout function to handle user logout and socket disconnection

const logout = async () =>{
    
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"]=null; 
        toast.success("Logged out successfully");
         if (socket) { 
        
        socket.disconnect();}
}
//update profile function to handle user profile updates and socket reconnection

const updateProfile = async(body)=>{
    try {
        const {data} = await axios.put("/api/auth/update-profile", body);
        if(data.success){
            setAuthUser(data.user);
            toast.success('Profile updated successfully ');
        }
     
    } catch (error) {
        toast.error(error.message);
        
    }

}

//connet socket function to handle the socket connection and online user updates

const connectSocket= (userData)=>{
    if(!userData|| socket?.connected) return; 
    const newSocket = io(backendUrl, {
        query:{
            userId: userData._id,

        }
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds)=>{
        setOnlineUser(userIds);
    })
    
    }

useEffect(()=>{
    if(token)
{
    axios.defaults.headers.common["token"] = token;
    checkAuth();



}

}, []);




    const value= {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile};


    return (<AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
        
        
        );

} 
  
export default AuthProvider;
