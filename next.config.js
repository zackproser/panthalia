/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'panthalia-images.s3.amazonaws.com'
    ],
  },
  transpilePackages: ['react-md-editor']
}

module.exports = nextConfig
