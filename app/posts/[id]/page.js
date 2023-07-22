'use client';

import { useState, useEffect } from 'react';

export function EditPost({ post }) {

  console.log(`EditPost component...:%o`, post)

  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);
  const [content, setContent] = useState(post.content);
  const [leaderImagePrompt, setLeaderImagePrompt] = useState(post.leaderimageprompt);
  const [imagePrompts, setImagePrompts] = useState(post.imageprompts);

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, '']);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedPost = {
      title,
      summary,
      content,
      leaderImagePrompt,
      imagePrompts
    };

    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPost)
    });

    if (response.ok) {
      console.log('Post updated successfully!');
    } else {
      console.error('Error updating post');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Title
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Summary
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40 resize-none"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>


      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Content:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Leader Image Prompt:
          <input
            type="text"
            value={leaderImagePrompt}
            onChange={(e) => setLeaderImagePrompt(e.target.value)}
          />
        </label>
      </div>

      <button type="button" onClick={addImagePrompt}>
        Add Image Prompt
      </button>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
        Update Post
      </button>
    </form>
  );
}


export default function EditPostPage({ params }) {

  const id = params.id

  console.log('EditPostPage...')
  console.log(`id: ${id}`)

  const [post, setPost] = useState()

  useEffect(() => {
    if (!id) return

    async function getPost() {
      const response = await fetch(`/api/posts/${id}`)
      const data = await response.json()
      setPost(data)
    }

    getPost()
  }, [id])

  if (!post) return <p>Loading...</p>

  return <EditPost post={post} />

}
