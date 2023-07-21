'use client'

import Image from 'next/image'
import styles from '../page.module.css'

import { useState } from 'react';

export function NewPostForm() {
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

    // Logic for submitting the form will go here...
  };

  return (
    <form onSubmit={submitForm}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Summary:
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <label>
        Content:
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      <label>
        Leader Image Prompt:
        <input type="text" value={leaderImagePrompt} onChange={(e) => setLeaderImagePrompt(e.target.value)} />
      </label>
      {imagePrompts.map((prompt, index) => (
        <label key={index}>
          Image Prompt {index + 1}:
          <input type="text" value={prompt} onChange={(e) => updateImagePrompt(index, e.target.value)} />
        </label>
      ))}
      <button type="button" onClick={addImagePrompt}>
        Add Image Prompt
      </button>
      <input type="submit" value="Create Post" />
    </form>
  );
}


export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>
      <NewPostForm />
    </main>
  )
}
