import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';

const RightSideBar = ({ selectedUser }) => {
  const { logout } = useContext(AuthContext);
  const { getMessages, message } = useContext(ChatContext); // Keep both
  const [mediaFiles, setMediaFiles] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch media files from messages when selected user changes
  useEffect(() => {
    const fetchMedia = async () => {
      if (selectedUser?._id) {
        try {
          // First ensure we have the latest messages
          await getMessages(selectedUser._id);
          
          // Then filter messages that have images (both sent and received)
          if (message && message.length > 0) {
            const images = message.filter(msg => msg && msg.image);
            setMediaFiles(images);
          }
        } catch (error) {
          console.error("Failed to fetch media:", error);
        }
      }
    };
    
    fetchMedia();
  }, [selectedUser, getMessages, message]);

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img 
          src={selectedUser?.profilepic || assets.avatar_icon} 
          alt="" 
          className='w-20 aspect-square rounded-full object-cover'
        />
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
          {selectedUser.fullName}
        </h1>
        <p className='px-10 mx-auto'>{selectedUser.bio || "No bio available"}</p>
      </div>
      <hr className="border-[#ffffff50] my-4"/>
      <div className='px-5 text-xs'>
        <p>Media History</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {mediaFiles.length > 0 ? (
            mediaFiles.map((msg, index) => (
              <div 
                key={msg._id || index} 
                onClick={() => window.open(msg.image)} 
                className='cursor-pointer rounded hover:opacity-80 transition-opacity'
              >
                <img 
                  src={msg.image} 
                  alt="" 
                  className='w-full h-24 object-cover rounded-md'
                />
              </div>
            ))
          ) : (
            <p className='text-gray-400 col-span-2 text-center py-4'>No media shared yet</p>
          )}
        </div>
      </div>
      
      {/* Fixed position logout button */}
      <div className='sticky bottom-5 w-full flex justify-center pb-4'>
        <button 
          onClick={handleLogout}
          className='bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer hover:opacity-90 transition-opacity'
        >
          Logout
        </button>
      </div>
    </div>     
  )
}

export default RightSideBar;