import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import checkIcon from '../../public/check-icon.png'

import { truncate } from '../utils/posts';

export default function PostCard({ post, deletePost }) {

  const handleDelete = async () => {
    await deletePost(post.id);
  }

  const [deleteState, setDeleteState] = useState('idle');
  const [deleteTimeout, setDeleteTimeout] = useState(null);

  useEffect(() => {
    return () => {
      if (deleteTimeout) clearTimeout(deleteTimeout);
    };
  }, [deleteTimeout]);

  const handleDeleteClick = async () => {
    if (deleteState === 'idle') {
      setDeleteState('confirm');
    } else if (deleteState === 'confirm') {
      setDeleteState('deleting');
      try {
        await handleDelete();
        setDeleteState('deleted');
        const timeout = setTimeout(() => {
          // Remove post from the list here
        }, 2000);
        setDeleteTimeout(timeout);
      } catch (error) {
        console.error('Error deleting the post:', error);
        setDeleteState('idle');
      }
    }
  };

  let buttonText = "Delete";

  switch (deleteState) {
    case 'confirm':
      buttonText = "Are you sure?";
      break;
    case 'deleting':
      buttonText = "Deleting";
      break;
    case 'deleted':
      buttonText = "Successfully deleted";
      break;
    default:
      break;
  }

  return (
    <div className="w-80 h-80 mx-auto bg-amber-100 rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="flex flex-col h-full p-4">
        <div>
          <Link href={`/posts/${post.id}`} className="block mt-1 text-lg leading-tight font-bold text-slate-900 hover:underline">
            {post.id} - {post.title}
          </Link>

          <div className="flex items-center p-3">
            <Image src={post.leaderimageurl ?? 'https://picsum.photos/200/300'} width={75} height={75} />
          </div>

          <p className="mt-2 text-slate-800">{truncate(post.summary, 50)}</p>
          <p className="mt-2 text-slate-600">{truncate(post.content, 50)}</p>

          <div className="mt-auto flex space-x-2 pb-2 items-center">
            {/* Render post status */}
            {post.status === 'published' && <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1.5 rounded">Published</span>}
            {post.status === 'drafting' && <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1.5 rounded">Draft</span>}

            {/* Render PR icon if post has PR */}
            {post.githubpr && (
              <Link
                className="text-white"
                href={post.githubpr}>
                <div className="inline-flex items-center bg-green-500 rounded px-1 py-1">
                  <Image src={"/octocat.svg"} width={24} height={24} />
                  <Image className="fill-current text-white" src={"/github-pr.svg"} width={24} height={24} />
                </div>
              </Link>
            )}

            <Link href={`/posts/${post.id}`}>
              <button className="inline-flex items-center gap-x-1.5 rounded-md bg-orange-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                Edit
              </button>
            </Link>

            <button onClick={handleDeleteClick} className="inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
              {deleteState == "confirm" &&
                <Image
                  width={15}
                  height={15}
                  src={checkIcon}
                  alt="confirm deletion icon"
                />}
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

}
