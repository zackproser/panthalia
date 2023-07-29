export default interface Post {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  gitbranch: string;
  githubpr: string;
  leaderimageurl: string;
  leaderImagePrompt: string;
  imagePrompts: string[];
}
