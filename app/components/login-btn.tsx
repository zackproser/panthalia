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
      <div className="flex items-center justify-center h-screen">
        <div className="w-full p-3">
          <Image
            src={panthaliaLogo}
            width={350}
            height={350}
            alt={altTag}
          />
        </div>
        <div className="w-full p-3">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => signIn()}
          >
            Login to PANTHALIA
          </button>
        </div>
      </div>
    </>
  )
}

