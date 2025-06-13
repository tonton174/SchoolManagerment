import Image from 'next/image';

const Navbar = () => {
  return (
    <div className='flex items-center justify-between p-4'>
      <div className="hidden md:flex">
        <Image src="/search.png" alt="Logo" width={32} height={32} />
        <span className='ml-2 text-lg font-semibold'>Winki School</span>
      </div>
    </div>
  )
}

export default Navbar