'use client'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <nav className='flex justify-between items-center lg:py-5 md:pt-4 pt-3 md:pb-4 pb-3 lg:px-10 md:px-8 px-5 bg-purple-600 text-white'>
      <div className="lg:text-3xl md:text-3xl text-xl font-bold">SkillMatch AI</div>
      <div className='flex lg:gap-4 md:gap-4 gap-2 lg:text-xl md:text-xl text-lg'>
      <Link href={'/'}>Dashboard</Link>
      </div>
      <span className='lg:text-xl md:text-xl text-lg'>Profile</span>
    </nav>
  )
}

export default Header