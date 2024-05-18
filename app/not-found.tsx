import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='w-full h-svh flex flex-col items-center justify-center gap-8'>
      <h1 className='text-3xl'>WOOPS...</h1>
      <p className='text-2xl'>The page you were looking for does not exist</p>
      <Link href="/" className='bg-gray-200/20 p-3 px-12 rounded-full'>Take me Home</Link>
    </div>
  )
}