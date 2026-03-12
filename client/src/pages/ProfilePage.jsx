import React, { useState, useContext, useRef, useEffect } from 'react' 
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, updateProfile, logout } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const profileCardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
        navigate('/');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updateData = { fullName: name, bio };
      
      if (selectedImage) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onloadend = async () => {
          const base64Image = reader.result;
          await updateProfile({ ...updateData, profilePic: base64Image });
          setIsLoading(false);
          navigate('/');
        };
      } else {
        await updateProfile(updateData);
        setIsLoading(false);
        navigate('/');
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div 
        ref={profileCardRef}
        className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'
      >
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input 
              onChange={handleImageChange}
              type="file" 
              id='avatar' 
              accept='.png, .jpg, .jpeg' 
              hidden 
            />
            <img 
              src={previewUrl || authUser?.profilepic || assets.avatar_icon}  // FIXED: use profilepic
              alt="" 
              className='w-12 h-12 rounded-full object-cover' 
            /> 
            Upload profile image
          </label>
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            required 
            placeholder='Your name' 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' 
          />
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            required 
            placeholder='Write your bio here' 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' 
            rows={4}
          />
          <button 
            type='submit' 
            disabled={isLoading}
            className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer disabled:opacity-50'
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          
          <button 
            type='button'
            onClick={handleLogout}
            className='bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-full text-lg cursor-pointer mt-2'
          >
            Logout
          </button>
        </form>
        <img 
          src={previewUrl || authUser?.profilepic || assets.logo_icon}  // FIXED: use profilepic
          alt="" 
          className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover' 
        />
      </div>
    </div>
  );
};

export default ProfilePage;