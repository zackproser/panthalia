export interface imagePrompt {
  postId: number;
  text: string,
  // The type is a string that can either be "leader" or "image"
  type: "leader" | "image"
}
