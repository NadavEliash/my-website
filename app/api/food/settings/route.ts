import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'food-store.json')

async function readStore() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeStore(data: object) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const store = await readStore()
    return NextResponse.json(store.settings)
  } catch {
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const store = await readStore()
    store.settings = body
    await writeStore(store)
    return NextResponse.json(store.settings)
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
