import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { staffFromRequest } from '@/lib/food-auth'

export async function POST(req: NextRequest) {
  if (!staffFromRequest(req)) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  const timestamp = Math.round(Date.now() / 1000)
  const secret = process.env.CLOUDINARY_API_SECRET ?? ''
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${secret}`)
    .digest('hex')
  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  })
}
