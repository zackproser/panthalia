// utils/posts.js

import { serialize } from 'next-mdx-remote/serialize'

export function generatePostContent(title, summary, content, imagePrompts) {

  const mdx = `
  # ${title} 
  
  ${summary}
  
  ${content}
  
  ${imagePrompts.map(prompt => `![${prompt}]()`).join('\n\n')}
  `

  // Use next-mdx-remote to compile MDX string to JSX
  const jsx = serialize(mdx)

  // Return compiled JSX as string
  return jsx.toString()
}

