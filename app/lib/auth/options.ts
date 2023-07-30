import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  // Configure one or more authentication providers  
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return (profile as any).login === 'zackproser'
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}
