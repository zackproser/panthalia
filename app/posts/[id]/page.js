'use client';

import styles from '../../page.module.css'

import { useState, useEffect } from 'react';

import Link from 'next/link'
import Image from 'next/image'

import panthaliaLogo from '/public/panthalia-logo-2.png'
import Spinner from '../../utils/spinner'
import ReloadIcon from '../../utils/reload-icon';

import { useSession } from 'next-auth/react';
import Header from '../../components/header'
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
  const [deletingImage, setDeletingImage] = useState(null)
  const [showImages, setShowImages] = useState(true)
  const [commitingImages, setCommitingImages] = useState(false)

  useEffect(() => {
    console.log(`useEffect is running..`)
    fetch(`/api/images/${post.id}`)
      .then(response => response.json())
      .then(data => {
        console.log(`EditPost get /api/images${post.id}: %o`, data);
        setImages(data.images)
      })
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

  const toggleImages = () => {
    setShowImages(!showImages)
  }

  console.log(`EditPost component...:%o`, post)

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);
  const [content, setContent] = useState(post.content);

  const addImagePrompt = () => {
    setImages([...images, { text: '' }]);
  };

  const addImageToPostBody = (importStatement, nextImageStatement) => {
    console.log(`addImageToPostBody: importStatement: ${importStatement}, nextImageStatement: ${nextImageStatement}`)
    // If the image variable has already been imported in the post body, don't import it again, 
    // just render the image link the body of the content 
    let newContent = ''
    if (content.includes(importStatement)) {
      console.log(`The image has already been imported in the post body.`)
      newContent = `${content}\n\n${nextImageStatement}`
    } else {
      console.log(`The image has not been imported in the post body.including import statement`)
      newContent = `${content} \n\n${importStatement} \n\n${nextImageStatement} `
    }
    console.log(`newContent: ${newContent} `)
    setContent(newContent)
  }

  const addNewsletterCaptureToPostBody = () => {
    const newContent = `${content} \n\n < Newsletter /\> `

    setContent(newContent)
  }

  const updateImagePrompt = (index, prompt) => {
    const imagePrompt = { text: prompt }
    setImages([...images, imagePrompt]);
  };

  const deleteImagePrompt = (index, prompt) => {
    // delete the image prompt identified by the current index
    setImages([...images.slice(0, index), ...images.slice(index + 1)])

  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setEditing(true);

    // updatedPost is the object sent to the /api/posts PUT route 
    // It represents all the changes the user could make from the posts edit UI
    const updatedPost = {
      title,
      summary,
      content,
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

        {images.map((prompt, index) => (

          <div key={index} className="flex items-center space-x-4">

            <input
              type="text"
              value={prompt.text}
              onChange={(e) => updateImagePrompt(index, e.target.value)}
              className="flex-1 p-2 border rounded"
            />

            <button
              onClick={() => deleteImagePrompt(index)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>

            <button
              onClick={() => retryImagePrompt(index)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <ReloadIcon />
            </button>

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

      {/* Show user the images are still being loaded... */}
      {loadingImages && (<h1><Spinner /> Loading images...</h1>)}

      {showImages && (
        <div className="mt-4">
          {/* Show images */}
          <hr className="w-148 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700"></hr>
          <div>
            <div className="grid grid-cols-3 gap-4">
              {(images.length > 0) && images.map(image => (image.image_url !== '' && typeof (image.image_url) != 'undefined' &&
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
                    {image.slug}
                  </button>

                  <button
                    className="absolute top-0 right-0 bg-green-300 hover:bg-green-400 text-white font-bold py-1 px-2 rounded"
                    onClick={() => {
                      addImageToPostBody(image.import_statement, image.rendered)
                    }}
                  >
                    Add image to post
                  </button>

                  <button
                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleDeleteImage(image.id, image.image_url)}
                  >
                    {(deletingImage && deletingImage === image.id) ? <> <Spinner /> Deleting... </> : 'Delete'}
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
  console.log(`id: ${id} `)

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
            width={350}
            height={350}
            className="mt-4 mb-12"
          />
          <EditPost post={post} />
        </div>
      </main>
    </>
  );
}
