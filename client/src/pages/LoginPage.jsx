import React, { useState } from 'react'
import assets from '../assets/assets'

const LoginPage = () => {
  const [currnetState, setCurrentState]=useState("sign up");
  const [ fullName, setFullname]=useState();
  const [ email, setEmail]=useState();
  const [ password, setPassword]=useState();
  const [ bio, setBio]=useState();
    const [ isDataSubmitted, setIsDataSubmitted]=useState(false);



  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* ............lft............. */}
<img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>
{/*.....right...... */}
<form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
<h2 className='font-medium text-2xl flex justify-between items-center'>{currnetState}
<img src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />
</h2>
{currnetState=="sign up" &(
<input type="text" className='p-2 border-gray-500 rounder-md focus:outline-none' placeholder='full name ' required />
)}

</form>
    </div>
  )
}

export default LoginPage
