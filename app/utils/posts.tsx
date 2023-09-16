import { PanthaliaImage } from '../types/images';

export async function fetchPosts() {
  const response = await fetch('/api/posts');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.posts;
}

const formatDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};


interface Metadata {
  title: string;
  author: string;
  date: string;
  description: string;
  image?: string;  // Optional property
}

export async function generatePostContent(title: string, summary: string, content: string, images: PanthaliaImage[]) {

  console.log(`generatePostContent title: ${title} summary: ${summary} content: ${content} images: %o`, images);

  let imageImportSet = new Set<string>();

  // If the heroImage is undefined then the portfolio repo will use its default hero image
  const heroImage = (images && images.length > 0) ? images[0].getImageVariableName() : 'wikka'

  for (const image of images) {
    imageImportSet.add(image.getImportStatement());
  }

  let imageImportMdx = ``

  for (const imageImport of imageImportSet) {
    imageImportMdx += `${imageImport}\n`;
  }

  let metadata: Metadata = {
    title,
    author: "Zachary Proser",
    date: formatDate(),
    description: summary,
    image: heroImage,
  };

  // The following template sets up the basic configuration for all my blog posts
  const baseMdx = `
import { ArticleLayout } from '@/components/ArticleLayout'
import { Newsletter } from '@/components/Newsletter'

import Image from 'next/image'
import Link from 'next/link'

export const meta = {
 title: "${metadata.title}",
 author: "${metadata.author}",
 date: "${metadata.date}",
 description: "${metadata.description}",
 image: ${metadata.image},
} 

export default (props) => <ArticleLayout meta={meta} {...props} />`

  const mdx = `
${imageImportMdx.trim()} 

${baseMdx.trim()} 

${content.trim()}
`
  return mdx
}

export function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
}

