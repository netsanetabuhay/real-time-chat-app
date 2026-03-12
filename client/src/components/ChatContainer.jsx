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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    console.log("Scrolling to bottom. Message count:", message?.length);
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedImage) {
      toast.error("Message or image is required");
      return;
    }
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    if (sending) return;
    
    setSending(true);
    
    try {
      const messagePayload = {
        text: newMessage.trim(),
        receiverId: selectedUser._id
      };
      
      // Add image if selected
      if (selectedImage) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onloadend = async () => {
          const base64Image = reader.result;
          messagePayload.image = base64Image;
          await sendMessag(messagePayload);
          setNewMessage("");
          setSelectedImage(null);
          setImagePreview(null);
          setSending(false);
        };
      } else {
        await sendMessag(messagePayload);
        setNewMessage("");
        setSending(false);
      }
    } catch (error) {
      console.error("Error in sendMessag:", error);
      toast.error("Failed to send message");
      setSending(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
          src={selectedUser.profilepic || assets.avatar_icon}
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

      {/* Chat area - FIXED status indicators */}
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
                    src={selectedUser.profilepic || assets.avatar_icon}
                    alt=""
                    className='w-7 h-7 rounded-full object-cover'
                  />
                )}
                
                <div className={`max-w-[70%] ${isSentByMe ? 'order-1' : 'order-2'}`}>
                  {msg.image ? (
                    <div className='relative'>
                      <img
                        src={msg.image}
                        alt=""
                        className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden'
                      />
                    </div>
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
                  <p className='text-xs text-gray-400 mt-1 text-right flex items-center justify-end gap-1'>
                    {formatMessageTime(msg.createdAt)}
                    {isSentByMe && (
                      <span className='ml-1'>
                        {msg.seen ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
                
                {isSentByMe && (
                  <img
                    src={authUser?.profilepic || assets.avatar_icon}
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

      {/* Image preview */}
      {imagePreview && (
        <div className='absolute bottom-20 left-3 bg-[#1a1a2e] p-2 rounded-lg border border-gray-600'>
          <div className='relative'>
            <img src={imagePreview} alt="Preview" className='max-w-[150px] max-h-[150px] rounded' />
            <button
              onClick={removeImage}
              className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Bottom area */}
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
          <input 
            type="file" 
            id="image" 
            accept='image/*' 
            onChange={handleImageChange}
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <button 
          type="submit"
          disabled={sending || (!newMessage.trim() && !selectedImage)}
          className='disabled:opacity-50'
        >
          <img src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;