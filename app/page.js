'use client';

import { useState, useEffect } from 'react';
import { fetchPosts } from './utils/posts';
import { useSession } from 'next-auth/react';
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
      <div className="max-w-7xl mx-auto p-4 w-full bg-gradient-to-r from-green-400 to-green-800">

        <div className="flex items-center p-6"> <h1 className="text-3xl font-bold">Panthalia</h1>
          <img
            src="/panthalia-logo-2.png"
            className="h-36 w-36 rounded-md border border-gray-200 ml-4"
          />
          {/* Add input to allow search query update */}
          <input
            type="text"
            className="w-full rounded-md border border-gray-200 ml-2 p-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
          />

        </div>

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

