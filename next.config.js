/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  transpilePackages: ['react-md-editor']
}

module.exports = nextConfig
