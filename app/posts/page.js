'use client'

import styles from '../page.module.css'

import Image from 'next/image'
import Link from 'next/link'
import panthaliaLogo from '/public/panthalia-logo-2.png'

import Spinner from '../utils/spinner'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import Header from '../components/header'
import LoginButton from '../components/login-btn'
import SpeechToText from '../components/SpeechToText'

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

function NewPostForm() {
  const { data: session } = useSession();

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imagePrompts, setImagePrompts] = useState([{ type: 'image', text: '' }]);

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, { type: 'image', text: '' }]);
  };

  const updateImagePrompt = (index, prompt) => {
    const imagePrompt = { type: 'image', text: prompt }
    imagePrompts[index] = imagePrompt
    setImagePrompts([...imagePrompts])
  };

  const submitForm = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    // Call API to create new post
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        summary,
        content,
        imagePrompts
      })
    });

    const data = await response.json();

    console.log(`Response: %o`, data);

    setSubmitting(false);

    // Handle response
    if (data.success) {
      // If the create post call was successfully, immediately return the user to the index page 
      router.push(`/`)

    } else {
      //  TODO - implement error state
      // Show error message
      console.log(`Error submitting new post form: %o`, data)
    }
  };

  if (!session) {
    return (
      <>
        <LoginButton />
      </>
    );
  }

  return (
    <>
      <SpeechToText content={content} updateFunc={setContent} />
      <form onSubmit={submitForm} className="new-post-form w-full mb-4">
        <div className="w-full mb-4">
          <label className="font-semibold text-lg">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-rounded p-2 border"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-semibold text-lg">Summary:</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="p-2 border rounded h-20"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-semibold text-lg">Content:</label>
          <MDEditor value={content} onChange={setContent} />
        </div>
        {imagePrompts.map((prompt, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <label className="font-semibold text-lg">Image Prompt {index + 1}:</label>
            <input
              type="text"
              value={prompt.text}
              onChange={(e) => updateImagePrompt(index, e.target.value)}
              className="p-2 border rounded"
            />
          </div>
        ))}
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

          <button
            type="button"
            onClick={addImagePrompt}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Image Prompt
          </button>

          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {submitting ? (
              <>
                <span>Spreading the seeds...</span>
                <Spinner />
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form >
    </>
  );
}


export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="flex flex-wrap items-center justify-center mt-12">
          <Image
            src={panthaliaLogo}
            alt="Panthalia"
            width={350}
            height={350}
            className="mt-4 mb-12"
          />
          <NewPostForm />
        </div>
      </main>
    </>
  )
}
