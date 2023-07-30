import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'

import { useSession, signIn, signOut } from "next-auth/react"

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
        <Image src={panthaliaLogo} alt="PANTHALIA" />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => signIn()}
        >
          Login to PANTHALIA
        </button>
      </div>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}

