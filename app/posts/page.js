'use client'

import styles from '../page.module.css'

import Image from 'next/image'
import panthaliaLogo from '/public/panthalia-logo-2.png'

import Spinner from '../utils/spinner'

import { useState } from 'react';

import { useRouter } from 'next/navigation';


function NewPostForm() {

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [leaderImagePrompt, setLeaderImagePrompt] = useState('');
  const [imagePrompts, setImagePrompts] = useState(['']);

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, '']);
  };

  const updateImagePrompt = (index, prompt) => {
    const updatedPrompts = [...imagePrompts];
    updatedPrompts[index] = prompt;
    setImagePrompts(updatedPrompts);
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
        leaderImagePrompt,
        imagePrompts
      })
    });

    const data = await response.json();

    console.log(`Response: %o`, data);

    setSubmitting(false);

    // Handle response
    if (data.success) {
      // Clear form
      setTitle('');
      setSummary('');
      setContent('');
      setLeaderImagePrompt('');
      setImagePrompts(['']);

      router.push(`/`)

    } else {
      //  TODO - implement error state
      // Show error message
    }
  };

  return (
    <form onSubmit={submitForm} className="w-full mb-4">
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="p-2 border rounded h-40"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <label className="font-semibold text-lg">Leader Image Prompt:</label>
        <input
          type="text"
          value={leaderImagePrompt}
          onChange={(e) => setLeaderImagePrompt(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      {imagePrompts.map((prompt, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <label className="font-semibold text-lg">Image Prompt {index + 1}:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => updateImagePrompt(index, e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      ))}
      <div className="flex justify-center space-x-4 mt-12 mb-4">
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
    </form>
  );
}


export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div className="w-full flex flex-wrap items-center justify-center">
          <Image
            src={panthaliaLogo}
            alt="Panthalia"
            width={350}
            height={350}
            className="mb-12"
          />
          <NewPostForm />
        </div>
      </div>
    </main>
  )
}
