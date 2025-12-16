import Image from 'next/image'
import React from 'react'

const TUserProfile = () => {
  return (
    <div className='w-[12rem] flex gap-3 items-center px-3 py-1 bg-[#2D3430] hover:bg-[#444946] text-[#A1A5A3] cursor-pointer transition-all duration-300 text-[16px] rounded-sm'>
      <div>
        <Image src="/images/ava.jpg" alt="avatar" width={40} height={40} className="rounded-full object-cover w-10 h-10" />
      </div>
      <div>
        <h2 className='font-semibold'>Dr. Rashid</h2>
        <span className='text-[13px] font-normal'>Manager</span>
      </div>
    </div>
  )
}

export default TUserProfile