'use client';

import styles from '../../page.module.css'

import { useState, useEffect } from 'react';

import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'
import Spinner from '../../utils/spinner'

import { useSession } from 'next-auth/react';
import Header from '../../components/header'
import LoginButton from '../../components/login-btn'

import SpeechToText from '../../components/SpeechToText'

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

function EditPost({ post }) {

  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [deletingImage, setDeletingImage] = useState(null)
  const [commitingImages, setCommitingImages] = useState(false)

  useEffect(() => {
    console.log(`useEffect is running..`)
    fetch(`/api/images/${post.id}`)
      .then(response => response.json())
      .then(data => { console.dir(data.images); setImages(data.images) })
    setLoadingImages(false)
  }, [post.id])

  const handleDeleteImage = (imageId, imageUrl) => {
    setDeletingImage(imageId)
    console.log(`Edit post component - handleDelete is running...imageId: ${imageId}, imageUrl: ${imageUrl}`)
    fetch(`/api/images/${imageId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ imageId, imageUrl })
      })
      .then(response => {
        if (response.ok) {
          setImages(images.filter(image => image.id !== imageId))
        }
      })
  }

  const commitImages = () => {
    console.log(`commitImages is running`)
    setCommitingImages(true)
    fetch(`/api/commit-images/${post.id}`, { method: 'GET' })
      .then(response => {
        if (response.ok) {
          setCommitingImages(false)
        }
      }).catch(error => {
        console.error(error)
      })
  }

  console.log(`EditPost component...:%o`, post)

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);
  const [content, setContent] = useState(post.content);
  const [imagePrompts, setImagePrompts] = useState([]);

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, { type: 'image', text: '' }]);
  };

  const addImageToPostBody = (nextImageStatement) => {
    const newContent = `${content}\n\n${nextImageStatement}`
    console.log(`addImageToPostBody newContent: ${newContent}`)
    setContent(newContent)
  }

  const addNewsletterCaptureToPostBody = () => {
    const newContent = `${content}\n\n<Newsletter /\>`
    setContent(newContent)
  }

  const updateImagePrompt = (index, prompt) => {
    const imagePrompt = { type: 'image', text: prompt }
    imagePrompts[index] = imagePrompt
    setImagePrompts([...imagePrompts])
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setEditing(true);

    const updatedPost = {
      title,
      summary,
      content,
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
    <>
      <SpeechToText content={content} updateFunc={setContent} />

      <form onSubmit={handleSubmit} className="edit-post-form w-full mb-4">
        <div className="mb-4">
          <input
            placeholder="Title"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <input
            placeholder="Title"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>


        <div className="w-full mb-4">
          <MDEditor height={450} value={content} onChange={setContent} />
        </div>

        {imagePrompts.map((prompt, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Image prompt"
              value={prompt.text}
              onChange={(e) => updateImagePrompt(index, e.target.value)}
              className="p-2 my-2 border rounded"
            />
          </div>
        ))}

      </form>

      <div className="flex mt-2 mb-4 md:mb-8">
        <button className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline" type="button" onClick={addImagePrompt}>
          +prompt
        </button>

        <button
          disabled={editing}
          className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline" type="submit">
          {editing ? (
            <>
              <span>Updating...</span>
              <Spinner />
            </>
          ) : (
            'Commit changes'
          )}
        </button>

        <button
          className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline"
          disabled={commitingImages}
          onClick={commitImages}
        >
          {/* Show spinner if committing images */}
          {commitingImages && <Spinner />} Commit images to branch
        </button>

        <button
          className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline"
          onClick={addNewsletterCaptureToPostBody}
        >
          Email capture
        </button>

      </div>

      {(loadingImages && <span><Spinner /> Loading images...</span>)}

      <div className="mt-2">
        <div>
          <div className="grid grid-cols-3 gap-4">
            {(images.length > 0) && images.map(image => (
              <div key={image.id} className="relative">
                <Image
                  className="object-cover w-full rounded-md"
                  src={image.image_url}
                  alt={image.alt}
                  width={550}
                  height={550}
                />
                <button
                  className="absolute top-0 right-0 mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-green-300 hover:bg-green-400 text-white font-bold py-1 rounded"
                  onClick={() => {
                    addImageToPostBody(image.rendered)
                  }}
                >
                  +
                </button>

                <button
                  className="absolute bottom-0 right-0 mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-red-600 hover:bg-red-800 text-white font-bold py-1 rounded"
                  onClick={() => handleDeleteImage(image.id, image.image_url)}
                >
                  {(deletingImage && deletingImage === image.id) ? <> <Spinner /> Deleting... </> : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  );
}


export default function EditPostPage({ params }) {

  const [post, setPost] = useState()
  const { data: session } = useSession();

  const id = params.id

  console.log('EditPostPage...')
  console.log(`id: ${id}`)

  useEffect(() => {
    if (!id) return

    async function getPost() {
      const response = await fetch(`/api/posts/${id}`)
      const data = await response.json()
      setPost(data)
    }

    getPost()
  }, [id])


  if (!session) {
    return (
      <>
        <LoginButton />
      </>
    );
  }

  if (!post) return (
    <div>
      <div role="w-full flex items-center content-center">
        <p>Loading...</p>
        <Spinner />
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="w-full flex flex-wrap items-center justify-center mt-12">
          <Image
            src={panthaliaLogo}
            alt="Panthalia"
            width={250}
            height={250}
            className="mt-4 mb-12"
          />
          <EditPost post={post} />
        </div>
      </main>
    </>
  );
}
