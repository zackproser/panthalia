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
      <Header />
      <main className={styles.main}>
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 mt-12 text-emerald-700">Create New Post</h1>
          <SpeechToText content={content} updateFunc={setContent} />
          <form onSubmit={submitForm} className="space-y-6">
            <div>
              <label htmlFor="title" className="block font-medium">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="summary" className="block font-medium">Summary</label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="content" className="block font-medium">Content</label>
              <MDEditor value={content} onChange={setContent} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Image Prompts</h2>
              {imagePrompts.map((prompt, index) => (
                <div key={index} className="mb-4">
                  <label htmlFor={`prompt-${index}`} className="block font-medium">Prompt {index + 1}</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="text"
                      id={`prompt-${index}`}
                      value={prompt.text}
                      onChange={(e) => updateImagePrompt(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <SpeechToText content={prompt.text} updateFunc={(newText) => updateImagePrompt(index, newText)} />
                    {index === imagePrompts.length - 1 && (
                      <button
                        type="button"
                        onClick={addImagePrompt}
                        className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Link href="/">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {submitting ? (
                  <>
                    <span>Creating Post...</span>
                    <Spinner />
                  </>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return <NewPostForm />;
}
