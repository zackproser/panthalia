'use client';

import styles from '../../page.module.css'

import Link from 'next/link'
import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'

import { useState, useEffect } from 'react';

function EditPost({ post }) {

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
    <form onSubmit={handleSubmit} className="edit-post-form w-full mb-4">
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40 resize-none"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
            value={leaderImagePrompt}
            onChange={(e) => setLeaderImagePrompt(e.target.value)}
          />
        </label>
      </div>

      <div className="flex justify-center space-x-4 mt-12 mb-4">
        <Link
          href={"/"}
        >
          <button
            type="button"
            className="px-4 py-2 bg-blue-300 text-white rounded hover:bg-blue-600"
          >
            Posts
          </button>
        </Link>


        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={addImagePrompt}>
          Add Image Prompt
        </button>

        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Update Post
        </button>

      </div>
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

  if (!post) return (
    <div>
      <div role="status content-center">
        <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
      <p>Loading...</p>
    </div>
  );

  return (
    <main className={styles.main}>
      <div className="w-full flex flex-wrap items-center justify-center">
        <Image
          src={panthaliaLogo}
          alt="Panthalia"
          width={350}
          height={350}
          className="mb-12"
        />
        <EditPost post={post} />
      </div>
    </main>
  );
}
