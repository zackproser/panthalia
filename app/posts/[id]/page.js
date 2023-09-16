'use client';

import styles from '../../page.module.css'

import { useState, useEffect } from 'react';

import Image from 'next/image'

import Spinner from '../../utils/spinner'

import { useSession } from 'next-auth/react';
import Header from '../../components/header'
import LoginButton from '../../components/login-btn'

import SpeechToText from '../../components/SpeechToText'

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

import {
  TrashIcon,
  ArrowPathRoundedSquareIcon as RefreshIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid'

import ConfirmationModal from '../../components/ConfirmationModal'

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

function EditPost({ post }) {

  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [commitingImages, setCommitingImages] = useState(false)
  const [imagePrompts, setImagePrompts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary);
  const [content, setContent] = useState(post.content);
  // state to track which prompts are regenerating
  const [isRegenerating, setIsRegenerating] = useState({});
  // State to manage which control sections to show or hide 
  const [showImagePrompts, setShowImagePrompts] = useState(true);
  const [showOtherButtons, setShowOtherButtons] = useState(false);
  const [showImages, setShowImages] = useState(true);


  useEffect(() => {
    console.log(`useEffect is running..`);
    fetchAndUpdateImages();
    setLoadingImages(false);
  }, [post.id])

  const fetchAndUpdateImages = () => {
    console.log("Fetching and updating images..");
    fetch(`/api/images/${post.id}`)
      .then(response => response.json())
      .then(data => {
        setImages(data.images);
        const imgPrompts = data.images ? data.images.map(image => ({ imageId: image.id, text: image.text ?? '' })) : [];
        setImagePrompts(imgPrompts);
      });
  };

  const openModal = (config) => {
    setModalConfig(config);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleRegen = (index, imageId, text) => {
    return new Promise((resolve, reject) => {
      console.log(`Edit post component - handleRegen is running...index: ${index} imageId: ${imageId}, prompt text: ${text}`);

      fetch(`/api/generate-images/`,
        {
          method: 'POST',
          body: JSON.stringify({ imageId, postId: post.id, text, regen: true })
        })
        .then(response => {
          if (response.ok) {
            resolve();
          } else {
            reject(new Error('Failed to regenerate image'));
          }
        })
        .catch(error => {
          console.log(`error in handleRegen: ${error}`);
          reject(error)
        })
        .finally(() => {
          // fetch and update images after either resolving or rejecting the Promise
          setTimeout(fetchAndUpdateImages, 25000);
        });
    });
  }

  const handleConfirmedRegen = (index, imageId, text) => {
    setShowModal(false);

    // Set the regenerating status for the specific image prompt
    setIsRegenerating(prevState => ({ ...prevState, [index]: true }));

    handleRegen(index, imageId, text)
      .then(() => {
        // Reset the regenerating status after operation is complete
        setIsRegenerating(prevState => {
          const newState = { ...prevState };
          delete newState[index];
          return newState;
        });
      }).catch((error) => {
        console.error(`Error regenerating image with id: ${imageId} error: ${error}`);
      });
  };

  const handleConfirmedDelete = (imageId, index) => {
    return new Promise((resolve, reject) => {
      setShowModal(false);

      handleDeleteImage(imageId, index)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  };

  const handleDeleteImage = (imageId, index) => {
    return new Promise((resolve, reject) => {
      const promptText = imagePrompts[index].text

      // Drop the visual image prompt input on the edit page 
      deleteImagePromptByIndex(index);

      // If the text is empty, just resolve the promise
      if (promptText === '') {
        setImages(images.filter(image => image.id !== imageId));
        resolve();
        return;
      }

      // Otherwise, we need to make a DELETE call to remove the image from DB
      console.log(`Edit post component - handleDelete is running...imageId: ${imageId}`);
      fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        body: JSON.stringify({ imageId })
      })
        .then(response => {
          if (response.ok) {
            setImages(images.filter(image => image.id !== imageId));
            resolve();
          } else {
            reject(new Error('Failed to delete image'));
          }
        })
        .catch(error => reject(error));
    });
  };

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

  const deleteImagePromptByIndex = (index) => {
    console.log(`deleteImagePromptByIndex is running...index: ${index}`)
    setImagePrompts(imagePrompts.filter((_prompt, i) => i !== index))
  }

  console.log(`EditPost component...:% o`, post)

  const addImagePrompt = () => {
    if (imagePrompts.length === 0) {
      setImagePrompts([{ text: '' }])
    }
    setImagePrompts([...imagePrompts, { text: '' }]);
  };

  const addImageToPostBody = (nextImageStatement) => {
    const newContent = `${content}\n\n${nextImageStatement}`
    console.log(`addImageToPostBody newContent: ${newContent}`)
    setContent(newContent)
  }

  const addNewsletterCaptureToPostBody = () => {
    const newContent = `${content}\n\n < Newsletter /\> `
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
      {showModal && (
        <ConfirmationModal
          show={showModal}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onClose={closeModal}
        />
      )}

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
      </form>

      <div className="w-full">
        <button onClick={() => setShowImagePrompts(!showImagePrompts)} className="mx-2 mb-2 pb-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline">
          {showImagePrompts ? <EyeSlashIcon width={16} /> : <EyeIcon width={16} />} Image Prompts
        </button>
        {showImagePrompts && (
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {imagePrompts.map((prompt, index) => (
              <div key={index} className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  style={{ flex: 1 }}
                  placeholder="Image prompt"
                  value={prompt.text}
                  onChange={(e) => updateImagePrompt(index, e.target.value)}
                  className="w-full p-2 my-2 border rounded flex-grow"
                />
                <button
                  onClick={() => {
                    openModal({
                      title: 'Confirm Deletion',
                      message: 'Are you sure you want to delete this image?',
                      onConfirm: () => handleConfirmedDelete(prompt.imageId, index),
                    });
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    openModal({
                      title: 'Confirm Regeneration',
                      message: `Are you sure you want to regenerate the image with prompt text: ${prompt.text}?`,
                      onConfirm: () => handleConfirmedRegen(index, prompt.imageId, prompt.text),
                    });
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  {isRegenerating[index] ? <Spinner /> : <RefreshIcon className="h-5 w-5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <button onClick={() => setShowOtherButtons(!showOtherButtons)} className="mb-2 mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline">
          {showOtherButtons ? <EyeSlashIcon width={16} /> : <EyeIcon width={16} />} Other Buttons
        </button>
        {showOtherButtons && (
          <div className="flex">
            {/* Existing other buttons code */}
            <button className="mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline" type="button" onClick={addImagePrompt}>
              +prompt
            </button>

            <button
              onClick={handleSubmit}
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
        )}
      </div>

      <div className="w-full">
        <button onClick={() => setShowImages(!showImages)} className="mt-2 mb-2 pb-2 mx-2 text-xs w-16 md:w-32 md:text-base lg:w-48 bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded focus:outline-none focus:shadow-outline">
          {showImages ? <EyeSlashIcon width={16} /> : <EyeIcon width={16} />} images
        </button>
        {showImages && (
          <div className="mt-2">
            <div>
              <div className="grid grid-cols-3 gap-4">
                {images && (images.length > 0) && images.map(image => (
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
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
        .catch((error) => {
          console.log(`getPost error fetching post id: ${id}: ${error}: response body: %o`, response)
        })
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
          <EditPost post={post} />
        </div>
      </main>
    </>
  );
}
