export async function fetchPosts() {
  const response = await fetch('/api/posts');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.posts;
}

export async function generatePostContent(title, summary, content, imagePrompts) {

  // The following template sets up the basic configuration for all my blog posts

  const mdx = `

import { ArticleLayout } from '@/components/ArticleLayout'
import { Newsletter } from '@/components/Newsletter'

import Image from 'next/image'
import Link from 'next/link'

export const meta = {
  author: "Zachary Proser",
  date: "${new Date().toLocaleDateString()}",
  title: "${title}",
  description: "${summary}", 
 }

export default (props) => <ArticleLayout meta={meta} {...props} />
  
 ${content}
  
`
  return mdx
}

