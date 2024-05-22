/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three'],
    images: {
        remotePatterns: [
            {
                hostname: "res.cloudinary.com"
            }
        ]
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false
        return config
    },
};

export default nextConfig;