import Image from 'next/image'
import panthaliaLogo from '/public/panthalia-logo-2.png'

import { useSession, signIn, signOut } from "next-auth/react"

const altTag = "PANTHALIA IS THE APP WHICH YOU WOULD BE ABLE TO LOG INTO IF YOU WERE ME"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }

  return (
    <>
      <div className="w-full h-screen bg-gradient-to-r from-green-400 to-green-800 relative overflow-hidden">
        {/* Ivy SVGs */}
        <svg className="absolute top-0 left-0 w-24 h-24 text-green-700 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-16 left-16 w-36 h-36 text-green-400 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-12 right-0 w-32 h-32 text-green-700 opacity-60 transform rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-36 right-6 w-32 h-32 text-green-700 opacity-60 transform rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-16 left-26 w-36 h-36 text-green-400 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-36 left-7 w-26 h-36 text-green-400 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        <svg className="absolute top-46 left-16 w-36 h-36 text-green-600 opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17 22 21 16.97 21 11C21 7.93 18.37 5.36 15 4.68V2.5C15 2.22 14.78 2 14.5 2S14 2.22 14 2.5V4.59C12.83 4.37 11.42 4.5 10.26 5.32C8.1 6.82 7.72 10.24 9.23 12.4C10.43 14.07 12.03 15 13.5 16C10.28 16.6 8 19.5 8 23H10C10 20.34 11.34 18 13 18C14.1 18 15 18.9 15 20H17C17 19.27 16.27 18 15 18C13.15 18 12 16.1 12 14C11.17 13.41 10.53 12.3 10.26 11.5H12.24C13.4 13.15 15.5 14 17.5 15C15.5 14 13.4 13.15 12.24 11.5C13.76 9.36 14.1 6.82 12.26 5.32C14.58 5.32 16 7.5 16 10C16 14 14 18 12 22Z" />
        </svg>

        {/* End Ivy SVGs */}

        <div className="relative">

          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-3">
              <Image
                src={panthaliaLogo}
                width={350}
                height={350}
                alt={altTag}
              />
            </div>
            <div className="p-3">
              <button
                className="bg-green-400 hover:bg-green-700 text-white font-bold py-2 px-12 rounded border-slate-300"
                onClick={() => signIn()}
              >
                Login to PANTHALIA
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

