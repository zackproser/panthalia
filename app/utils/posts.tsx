import { PanthaliaImage } from '../types/images';

export async function fetchPosts() {
  const response = await fetch('/api/posts');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.posts;
}

export async function generatePostContent(title: string, summary: string, content: string, images: PanthaliaImage[]) {

  console.log(`generatePostContent title: ${title} summary: ${summary} content: ${content} images: o%`, images);

  let imageImportSet = new Set<string>();

  // If the heroImage is undefined then the portfolio repo will use its default hero image
  const heroImage = images.length ? images[0].getImageVariableName() : undefined

  for (const image of images) {
    imageImportSet.add(image.getImportStatement());
  }

  let imageImportMdx = ``

  for (const imageImport of imageImportSet) {
    imageImportMdx += `${imageImport}\n`;
  }

  // The following template sets up the basic configuration for all my blog posts
  const baseMdx = `

    import { ArticleLayout } from '@/components/ArticleLayout'
    import { Newsletter } from '@/components/Newsletter'

    import Image from 'next/image'
    import Link from 'next/link'

    export const meta = {
      author: "Zachary Proser",
      date: "${new Date().toLocaleDateString()}",
      title: "${title}",
      description: "${summary}", 
      image: ${heroImage}
     }

    export default (props) => <ArticleLayout meta={meta} {...props} />
`
  const mdx = `
${imageImportMdx} 

${baseMdx} 

${content}
`
  return mdx
}

export function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
}

