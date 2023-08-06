'use client';

import styles from '../../page.module.css'

import { useState, useEffect } from 'react';

import Link from 'next/link'
import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'
import Spinner from '../../utils/spinner'

import { hyphenToCamelCase, imageSlug } from '../../utils/images'

import { useSession } from 'next-auth/react';
import LoginButton from '../../components/login-btn'

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
  const [showImages, setShowImages] = useState(true)
  const [commitingImages, setCommitingImages] = useState(false)

  useEffect(() => {
    console.log(`useEffect is running..`)
    fetch(`/api/images/${post.id}`)
      .then(response => response.json())
      .then(data => setImages(data.images))
    setLoadingImages(false)
  }, [post.id])

  const handleDelete = (imageId) => {
    fetch(`/api/images/${imageId}`, { method: 'DELETE' })
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



  const toggleImages = () => {
    setShowImages(!showImages)
  }

  console.log(`EditPost component...:%o`, post)

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);
  const [content, setContent] = useState(post.content);
  const [leaderImagePrompt, setLeaderImagePrompt] = useState(post.leaderimageprompt?.text ?? '');
  const [imagePrompts, setImagePrompts] = useState(JSON.parse(post.imageprompts));

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, { type: 'image', text: '' }]);
  };

  const addImageToPostBody = (image) => {
    const imgSlug = imageSlug(image)
    const imgName = hyphenToCamelCase(imgSlug)
    const importStatement = `import ${imgName} from '@/images/${imgSlug}.png';`
    const renderedImageStatement = `<Image src={${imgName}} />`
    const newContent = `${content}\n\n${importStatement}\n\n${renderedImageStatement}`

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
    <>
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


          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={addImagePrompt}>
            Add Image Prompt
          </button>

          <button
            disabled={editing}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            {editing ? (
              <>
                <span>Updating...</span>
                <Spinner />
              </>
            ) : (
              'Update post'
            )}
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={toggleImages}
          >
            {showImages ? 'Hide Images' : 'Show Images'}
          </button>

        </div>
      </form>

      <div>
        <button
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={commitingImages}
          onClick={commitImages}
        >
          {/* Show spinner if committing images */}
          {commitingImages && <Spinner />} Commit images to branch
        </button>
      </div>

      <div>
        <button
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={addNewsletterCaptureToPostBody}
        >
          Add Newsletter Capture
        </button>
      </div>


      {showImages && (
        <div className="mt-4">
          {/* Show images */}
          {(loadingImages && <span><Spinner /> Loading images...</span>)}
          <hr className="w-148 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700"></hr>
          <div>
            <div className="grid grid-cols-3 gap-4">
              {images.map(image => (
                <div key={image.id} className="relative">
                  <Image
                    className="object-cover w-full rounded-md"
                    src={image.image_url}
                    alt={image.alt}
                    width={550}
                    height={550}
                  />
                  <button
                    className="absolute top-0 left-0 bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 px-2 rounded"
                  >
                    {imageSlug(image.image_url)}
                  </button>

                  <button
                    className="absolute top-0 right-0 bg-green-300 hover:bg-green-400 text-white font-bold py-1 px-2 rounded"
                    onClick={() => {
                      addImageToPostBody(image.image_url)
                    }}
                  >
                    Add image to post
                  </button>

                  <button
                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleDelete(image.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
