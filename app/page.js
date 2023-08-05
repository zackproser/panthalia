'use client';

import { useState, useEffect } from 'react';
import { fetchPosts } from './utils/posts';
import { useSession } from 'next-auth/react';

import Image from 'next/image';


import LoginButton from './components/login-btn'
import PostCard from './components/PostCard';
import Spinner from './utils/spinner'

export default function PostsPage() {

  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const deletePost = async (postId) => {
    await fetch(`/api/posts/${postId}`, {
      method: 'DELETE'
    })
  }

  // Filter posts based on search query
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      const posts = await fetchPosts();
      setPosts(posts);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (!session) {
    return (
      <>
        <LoginButton />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row  md:mx-auto items-center md:w-3/4 lg:w-2/3 p-5">
        {/* Logo */}
        <Image
          src="/panthalia-logo-2.png"
          alt="Panthalia logo"
          className="md:pl-15"
          width={250}
          height={250}
        />

        {/* Search Bar */}
        <div className="mt-4 md:mt-0 md:pl-5 md:ml-5 w-full md:w-96">
          <input
            type="text"
            placeholder="Search for a post..."
            className="p-2 w-full md:w-64 rounded border shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>


      <div className="max-w-7xl mx-auto p-4 w-full bg-gradient-to-r from-green-400 to-green-800">
        {loading &&
          <div>
            <h1>Loading...</h1>
            <Spinner />
          </div>
        }

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              deletePost={deletePost}
            />
          ))}
        </div>
      </div>
    </>
  );
}

