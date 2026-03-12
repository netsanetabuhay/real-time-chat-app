import React, { useEffect, useRef, useState, useContext } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/formatMessageTime';
import { ChatContext } from '../../context/ChatContext';
import toast from 'react-hot-toast';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();
  const { message, sendMessag } = useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;
    
    setSending(true);
    try {
      await sendMessag({ text: newMessage });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
        <img src={assets.logo_icon} className='max-w-16' alt="" />
        <p className='text-lg font-medium text-white'>
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  return (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full object-cover"
        />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className='md:hidden max-w-7 cursor-pointer'
        />
        <img
          src={assets.help_icon}
          alt=""
          className='max-md:hidden max-w-5'
        />
      </div>

      {/* Chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {message && message.length > 0 ? (
          message.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 mb-4 ${
                msg.senderId === selectedUser._id ? 'justify-start' : 'justify-end'
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all ${
                    msg.senderId === selectedUser._id
                      ? 'bg-gray-600/30 rounded-br-none'
                      : 'bg-violet-500/30 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}

              <div className="text-center text-xs">
                <img
                  src={
                    msg.senderId === selectedUser._id
                      ? selectedUser.profilePic || assets.avatar_icon
                      : assets.avatar_icon
                  }
                  alt=""
                  className='w-7 rounded-full object-cover'
                />
                <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            No messages yet. Start chatting!
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom area with send functionality */}
      <form onSubmit={handleSendMessage} className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#1a1a2e]/90'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input 
            type="text" 
            placeholder="Send a message" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent'
          />
          <input type="file" id="image" accept='image/*' hidden/>
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          className='disabled:opacity-50'
        >
          <img src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;