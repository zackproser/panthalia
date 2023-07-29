'use client';

import styles from '../../page.module.css'

import { useState, useEffect } from 'react';

import Link from 'next/link'
import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'
import Spinner from '../../utils/spinner'

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

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


      <div className="w-full mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Content:
        </label>
        <MDEditor value={content} onChange={setContent} />
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
      <div role="w-full flex items-center content-center">
        <p>Loading...</p>
        <Spinner />
      </div>
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
