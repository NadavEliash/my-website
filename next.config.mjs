/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three'],
    images: {
        remotePatterns: [
            {
                hostname: "res.cloudinary.com"
            }
        ]
    }
};

export default nextConfig;