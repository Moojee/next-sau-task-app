import type { NextConfig } from 'next'
 
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kzqxnrnvwmhvucbtufcq.supabase.co',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
}
 
export default config