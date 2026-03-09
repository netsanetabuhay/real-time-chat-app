import {createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios, { Axios } from "axios";
import { data } from "react-router-dom";



export const ChatContext= createContext();

export const chatProvider = ({Children})=>{
    const [message, setMessage] = useState([]);
    const [users , serUsers] = useState([]);
    const [selectedUser, setSelectedUser]= useState(null);
    const [unSeenMessage, setUnSeenMessag] = useState({});
    const {socket, axios }= useContext(AuthContext);

    //function to get all users for sidebar
    const getUsers= async()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnSeenMessag(data.unSeenMessage)
            }
        } catch (error) {
            toast.error(error.message);     
            
        }
    }

    //function to get messages for selected user
    const getMessages= async()=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.seccess){
                setMessage(data.message)
            }


    
            
        } catch (error) {
            toast.error(error.message)
            
        }

    }
//funcion to send message to selected user

const sendMessag = async(messageData)=>{
    try {
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)

        if(data.success){
          
                setMessage((prevMessage)=>[
                    ...prevMessage, data.newMessage]
                ])

            
        }
        else{
            toast.error(error.message);
        }

    } catch (error) {
        toast.error(error.message)
        
    }
}
//function to sebscribe to messages for selected user

const subscribeToMessages = async()=>{
    if(selectedUser && newMessage.userId===selectedUser._id){
        newMessage.seen=true;
        setMessage(()=>[...prevMessage, newMessage]);
        axios.put(`/api/message/mare/${newMessage._id}`);

    }
    else{
        setUnSeenMessag(prevUnseenMessages)=>({
            ...prevUnseenMessages, [newMessage.senderId]:prevUnseenMessages[newMessage.senderId]? prevUnseenMessages[newMessage.senderId]+1 : 1

        })
    }
}

//function to unsubscribe
const unsubscribeFromMessages = ()=>{
    if(socket)socket.off('newMessage');

}

useEffect(()=>{
subscribeToMessages();
return ()=> unsubscribeFromMessages();


},[socket, selectedUser])

    const value = {

        message,
        users,
        selectedUser,
        getUsers,
        setMessage,
        sendMessag,
        setSelectedUser,
        unSeenMessage,
        setUnSeenMessag

    }
    
    return ( 
        <ChatContext.Provider value={value}>
            {Children}
        </ChatContext.Provider>
    )
}