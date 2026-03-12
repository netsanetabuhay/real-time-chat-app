import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from "../assets/assets";
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const SideBar = ({ setSelectedUser, selectedUser }) => {
  const { logout, onlineUsers, authUser } = useContext(AuthContext);
  const { getUsers, users, unSeenMessage } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const filteredUsers = input 
    ? users?.filter((user) => user.fullName?.toLowerCase().includes(input.toLowerCase())) 
    : users || [];

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleUserClick = (user) => {
    if (authUser?._id === user._id) {
      setSelectedUser(null);
      navigate('/profile');
      return;
    }
    setSelectedUser(user);
  };

  return (
    <div className={`bg-[#8185B2]/10 backdrop-blur-xl h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center pb-5'>
          <img src={assets.logo} alt="logo" className='max-w-40'/>
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt='menu' className='max-h-5 cursor-pointer'/>
            <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
              <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
              <hr className="my-2 border-t border-gray-500"/>
              <p onClick={() => logout()} className='cursor-pointer text-sm'>Logout</p>
            </div>
          </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mb-5'>
          <img src={assets.search_icon} alt="Search" className='w-3'/>
          <input 
            onChange={(e) => setInput(e.target.value)}
            value={input}  
            type="text" 
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' 
            placeholder='Search User...'
          />
        </div>
      </div>

      <div className='flex flex-col'>
        {filteredUsers?.map((user) => {
          const isOnline = onlineUsers?.includes(user._id);
          
          return (
            <div
              onClick={() => handleUserClick(user)}
              key={user._id}  
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''}`}
            >
              <div className='relative'>
                <img
                  src={user?.profilepic || assets.avatar_icon}  // FIXED: use profilepic
                  alt=""
                  className='w-[35px] aspect-[1/1] rounded-full object-cover'
                />
                <span 
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1a1a2e] ${
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></span>
              </div>
              
              <div className='flex flex-col leading-5 flex-1'>
                <p>{user.fullName}</p>
                <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-neutral-400'}`}>
                  {isOnline ? 'Online' : ''}
                </span>
              </div>
              
              {unSeenMessage?.[user._id] > 0 && (
                <div className='bg-violet-600 text-white text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1.5'>
                  {unSeenMessage[user._id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>       
  );
}

export default SideBar;