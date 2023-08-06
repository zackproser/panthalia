export async function fetchPosts() {
  const response = await fetch('/api/posts');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.posts;
}

export async function generatePostContent(title, summary, content, leaderImageImportStatement, imageSrc) {

  console.log(`generatePostContent title: ${title} summary: ${summary} content: ${content} leaderImgImport: ${leaderImageImportStatement} imageSrc: ${imageSrc}`);

  // Form the leader image import statement so it can be passed in the post's metadata

  // The following template sets up the basic configuration for all my blog posts
  const mdx = `

import { ArticleLayout } from '@/components/ArticleLayout'
import { Newsletter } from '@/components/Newsletter'
${leaderImageImportStatement}


import Image from 'next/image'
import Link from 'next/link'

export const meta = {
  author: "Zachary Proser",
  date: "${new Date().toLocaleDateString()}",
  title: "${title}",
  description: "${summary}", 
  image: ${imageSrc}
 }

export default (props) => <ArticleLayout meta={meta} {...props} />
  
 ${content}
  
`
  return mdx
}

export function truncate(text, length) {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
}

