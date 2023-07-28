'use client';

import { useState, useEffect } from 'react';
import { fetchPosts } from './utils/posts';

import PostCard from './components/PostCard';

export default function PostsPage() {

  const [posts, setPosts] = useState([]);

  const deletePost = async (postId) => {
    await fetch(`/api/posts/${postId}`, {
      method: 'DELETE'
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      const posts = await fetchPosts();
      setPosts(posts);
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">

      <div className="flex items-center p-6">
        <h1 className="text-3xl font-bold">Panthalia</h1>
        <img
          src="/panthalia-logo-2.png"
          className="h-36 w-36 rounded-md border border-gray-200 ml-4"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            deletePost={deletePost}
          />
        ))}
      </div>
    </div>
  );
}

