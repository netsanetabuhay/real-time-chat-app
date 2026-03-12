import React, { useEffect, useRef, useState, useContext } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/formatMessageTime';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  console.log("ChatContainer rendering with selectedUser:", selectedUser);
  
  const scrollEnd = useRef();
  const { message, sendMessag } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    console.log("Scrolling to bottom. Message count:", message?.length);
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("HANDLE SEND MESSAGE CALLED");
    console.log("Event type:", e.type);
    console.log("========== SEND MESSAGE DEBUG ==========");
    console.log("1. handleSendMessage triggered");
    console.log("2. Message text:", newMessage);
    console.log("3. Selected user object:", selectedUser);
    console.log("4. Selected user ID:", selectedUser?._id);
    console.log("5. Selected user fullName:", selectedUser?.fullName);
    console.log("6. Sending status:", sending);
    
    if (!newMessage.trim()) {
      console.log("7. Empty message validation failed");
      toast.error("Message cannot be empty");
      return;
    }
    
    if (!selectedUser) {
      console.log("7. No user selected - selectedUser is null");
      toast.error("No user selected");
      return;
    }
    
    if (!selectedUser._id) {
      console.log("Selected user has no _id property");
      toast.error("Invalid user");
      return;
    }
    
    if (sending) {
      console.log("Already sending a message");
      return;
    }
    
    setSending(true);
    
    try {
      const messagePayload = {
        text: newMessage.trim(),
        receiverId: selectedUser._id
      };
     
      await sendMessag(messagePayload);
      setNewMessage("");
    } catch (error) {
      console.error("Error in sendMessag:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleButtonClick = () => {
    console.log("Button clicked directly");
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

  console.log(`Rendering chat for user: ${selectedUser.fullName}, ${message?.length || 0} messages`);

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
          onClick={() => {
            console.log("Back button clicked");
            setSelectedUser(null);
          }}
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
          message.map((msg, index) => {
            const isSentByMe = msg.sendrId === authUser?._id || msg.senderId === authUser?._id;
            
            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2 mb-4 ${
                  isSentByMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isSentByMe && (
                  <img
                    src={selectedUser.profilePic || assets.avatar_icon}
                    alt=""
                    className='w-7 h-7 rounded-full object-cover'
                  />
                )}
                
                <div className={`max-w-[70%] ${isSentByMe ? 'order-1' : 'order-2'}`}>
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden'
                    />
                  ) : (
                    <p
                      className={`p-3 md:text-sm font-light rounded-2xl break-words ${
                        isSentByMe
                          ? 'bg-violet-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-white rounded-bl-none'
                      }`}
                    >
                      {msg.message || msg.text}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1 text-right'>
                    {formatMessageTime(msg.createdAt)}
                    {isSentByMe && msg.seen && (
                      <span className='ml-2 text-green-400'>✓ Seen</span>
                    )}
                  </p>
                </div>
                
                {isSentByMe && (
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt=""
                    className='w-7 h-7 rounded-full object-cover order-2'
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            No messages yet. Start chatting!
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom area */}
      <form onSubmit={handleSendMessage} className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#1a1a2e]/90'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input 
            type="text" 
            placeholder="Send a message" 
            value={newMessage}
            onChange={(e) => {
              console.log("Input changed:", e.target.value);
              setNewMessage(e.target.value);
            }}
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
          onClick={handleButtonClick}
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