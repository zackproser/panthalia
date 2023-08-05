export function imageSlug(imageUrl: string) {
  let path = new URL(imageUrl).pathname
  if (path.startsWith('/')) {
    // Trim off the prefix forward slash
    path = path.substring(1)
  }
  return path
}
