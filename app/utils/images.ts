import slugify from 'slugify';

export function imageSlug(imageUrl: string) {
  let path = new URL(imageUrl).pathname
  if (path.startsWith('/')) {
    // Trim off the prefix forward slash
    path = path.substring(1)
  }
  return path
}

export function convertImagePromptToS3UploadPath(promptText: string): string {
  return slugify(promptText.toLowerCase().substring(0, 30))
}

export function hyphenToCamelCase(str: string): string {
  return str.split('-').map((word, index) => {
    // Return the first word as is, for all other words capitalize the first letter
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}
