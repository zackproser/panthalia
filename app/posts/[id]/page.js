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
      setImagePrompts([{ text: '', updateFunc: (newText) => updateImagePrompt(0, newText) }])
    }
    setImagePrompts([...imagePrompts, { text: '', updateFunc: (newText) => updateImagePrompt(imagePrompts.length, newText) }]);
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

  const [lastSaved, setLastSaved] = useState(Date.now());

  const humanReadableTimeSinceLastSaved = () => {
    const secondsSinceLastSaved = Math.floor((Date.now() - lastSaved) / 1000);
    if (secondsSinceLastSaved < 60) return `${secondsSinceLastSaved} seconds ago`;
    const minutesSinceLastSaved = Math.floor(secondsSinceLastSaved / 60);
    if (minutesSinceLastSaved < 60) return `${minutesSinceLastSaved} minutes ago`;
    const hoursSinceLastSaved = Math.floor(minutesSinceLastSaved / 60);
    if (hoursSinceLastSaved < 24) return `${hoursSinceLastSaved} hours ago`;
    const daysSinceLastSaved = Math.floor(hoursSinceLastSaved / 24);
    return `${daysSinceLastSaved} days ago`;
  };

  // Custom hook for debouncing effects
  function useDebouncedEffect(effect, dependencies, delay) {
    useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => clearTimeout(handler);
    }, [...dependencies, delay]);
  }

  // Use the custom hook for autosaving
  useDebouncedEffect(async () => {
    const updatedPost = {
      title,
      summary,
      content,
      imagePrompts
    };

    const response = await fetch(`/api/posts/${post.id}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPost)
    });

    if (response.ok) {
      console.log('Post autosaved successfully!');
      setLastSaved(Date.now());
    } else {
      console.error('Error autosaving post');
    }
  }, [title, summary, content, imagePrompts], 5000);


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


      <form className="pb-6 mb-12 space-y-12 w-full">
        <div className="border-b border-grey/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-lg text-2xl font-medium leading-6 text-white">
                Title
              </label>
              <div className="mt-2">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="text-white">Last saved {humanReadableTimeSinceLastSaved()}</p>
            </div>

            <div className="col-span-full">
              <label htmlFor="summary" className="block text-lg text-2xl font-medium leading-6 text-white">
                Description
              </label>
              <div className="mt-2">
                <input
                  id="summary"
                  name="summary"
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full pt-8 pb-8">
              <div className="mt-2">
                <MDEditor height={450} value={content} onChange={setContent} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-white">Images</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <button
                onClick={() => setShowImages(!showImages)}
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {showImages ? <EyeSlashIcon width={16} /> : <EyeIcon width={16} />} Images
              </button>
              {showImages && (
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                  {images && (images.length > 0) && images.map(image => (
                    <div key={image.id} className="relative">
                      <Image
                        className="rounded-lg"
                        src={image.image_url}
                        alt={image.alt}
                        width={550}
                        height={550}
                      />
                      <button
                        className="absolute top-0 right-0 rounded-md bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                        onClick={() => addImageToPostBody(image.rendered)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-white">Image Prompts</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <button
                onClick={() => setShowImagePrompts(!showImagePrompts)}
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {showImagePrompts ? <EyeSlashIcon width={16} /> : <EyeIcon width={16} />} Image Prompts
              </button>
              {showImagePrompts && (
                <div className="mt-6 space-y-6">
                  {imagePrompts.map((prompt, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          placeholder="Image prompt"
                          value={prompt.text}
                          onChange={(e) => updateImagePrompt(index, e.target.value)}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                        />
                        <SpeechToText content={prompt.text} updateFunc={prompt.updateFunc} />
                      </div>
                      <button
                        onClick={() => {
                          openModal({
                            title: 'Confirm Deletion',
                            message: 'Are you sure you want to delete this image?',
                            onConfirm: () => handleConfirmedDelete(prompt.imageId, index),
                          });
                        }}
                        className="rounded-md bg-red-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
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
                        className="rounded-md bg-yellow-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                      >
                        {isRegenerating[index] ? <Spinner /> : <RefreshIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="mt-12 pt-6 border-t border-white/10 pt-6 w-full">
        <h2 className="text-base font-semibold leading-7 text-white">Other Controls</h2>

        <div className="mt-4 flex space-x-4">
          <div className="flex items-center space-x-4">
            <MDEditor height={450} value={content} onChange={setContent} />
            <SpeechToText content={content} updateFunc={(newText) => setContent(content + '\n' + newText)} />
          </div>
        </div>

        <div className="mt-4 flex space-x-4">

          <button
            onClick={addImagePrompt}
            className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            +prompt
          </button>
          <button
            onClick={commitImages}
            disabled={commitingImages}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            {commitingImages && <Spinner />}
            Commit images to branch
          </button>
          <button
            onClick={addNewsletterCaptureToPostBody}
            className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
          >
            Email capture
          </button>
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
