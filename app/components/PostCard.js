import Image from 'next/image';
import Link from 'next/link';

export default function PostCard({ post, deletePost }) {

  const handleDelete = () => {
    deletePost(post.id);
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="px-2 py-2">
          <h3 className="text-lg font-bold truncate">{post.title}</h3>
        </div>

        <div className="flex items-center p-6">
          {/* Render post image */}
          <Image
            src={
              post.leaderimageurl ?? 'https://picsum.photos/200/300'
            }
            width={75}
            height={75}
          />
        </div>


        <div className="flex items-center px-4 py-2">
          {/* Render PR icon if post has PR */}
          {post.githubpr &&
            <>
              <Link href={post.githubpr}>
                <Image src={"/octocat.svg"} width={24} height={24} />
                <Image src={"/github-pr.svg"} width={24} height={24} />
              </Link>
            </>
          }
        </div>

        <div className="px-4 py-2">
          {/* Render post title */}

          {/* Render post summary */}
          <p className="text-gray-600 text-sm mt-1">{post.summary}</p>
        </div>

        <div className="px-4 pt-2 pb-4">
          {/* Render post status */}
          {post.status === 'published' &&
            <span className="bg-green-500 text-white text-xs font-bold mr-2 px-2 py-1 rounded">Published</span>
          }
          {post.status === 'drafting' &&
            <span className="bg-yellow-500 text-white text-xs font-bold mr-2 px-2 py-1 rounded">Draft</span>
          }
        </div>


        <div className="flex items-center rounded-md shadow-sm px-4 py-4">
          <div>
            <Link
              href={`/posts/${post.id}`}
            >
              <button
                type="button"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-orange-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Edit
              </button>
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Delete post
            </button>
          </div>
        </div>


      </div >
    </>
  )
}
