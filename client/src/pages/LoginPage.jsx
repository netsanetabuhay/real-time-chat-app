import React, { useState } from 'react'
import assets from '../assets/assets'

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("sign up");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* ............left............. */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>
      {/*.....right...... */}
      <form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currentState}
          <img src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />
        </h2>
        
        {currentState === "sign up" && !isDataSubmitted && (
          <input 
            type="text" 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2' 
            placeholder='Full Name' 
            onChange={(e) => setFullname(e.target.value)}
            value={fullName}
            required 
          />
        )}

        {!isDataSubmitted && (
          <>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              type="email" 
              placeholder='Email address' 
              required 
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2' 
            />
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password}  
              type="password" 
              placeholder='Password' 
              required 
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' 
            />
          </>
        )}
        
        {currentState === "sign up" && isDataSubmitted && (
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            rows={4} 
            className='p-2 focus:ring-2 focus:ring-indigo-500 border border-gray-500 rounded-md focus:outline-none'  
            placeholder='Provide a short bio...'  
            value={bio}
            required 
          />
        )}
        
        <button 
          type='submit' 
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'
        >
          {currentState === "sign up" ? "Create an Account" : "Login Now"}  
        </button>
        
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" name="" id="" />
          <p>Agree to use & privacy policy.</p>
        </div>
        
        <div className='flex flex-col gap-2'>
          {currentState === "sign up" ? (
            <p className='text-sm text-gray-600'>
              Already have an account? 
              <span className='font-medium text-violet-500 cursor-pointer' onClick={() => { setCurrentState("login"); setIsDataSubmitted(false); }}> Login here</span>  
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Create an account 
              <span className='font-medium text-violet-500 cursor-pointer' onClick={() => setCurrentState("sign up")}> Click here</span>  
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage;