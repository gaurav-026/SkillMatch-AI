'use client'
import React from 'react'
import ToggleSwitch from '@/components/ToggleSwitch';
import Image from 'next/image';
import illu from '../../asssets/4565.jpg'

const MainPage = () => {
  return (
    <div className='flex gap-10 justify-center lg:px-10 md:px-8 px-5 lg:py-10 md:py-8 py-5'>
        <div className='lg:w-[30%] md:w-[40%] w-full'>
        <ToggleSwitch/>
        </div>
        <Image src={illu} alt='illustration' width={400} 
        className='rounded-xl lg:block md:block hidden' />
    </div>
  )
}

export default MainPage;


