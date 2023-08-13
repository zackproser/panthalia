import Link from 'next/link';

export default function Component() {

  return (
    <>
      <div className="absolute top-0 left-0 w-full bg-green-800 p-4 mb-4">
        <nav className="flex justify-between">
          <Link href="/">
            <span className="text-lg font-bold pr-4 text-white">Home</span>
          </Link>
          <Link href="/posts">
            <span className="text-lg font-bold pr-4 text-white">Add Post</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

