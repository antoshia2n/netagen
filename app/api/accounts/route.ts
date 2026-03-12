import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ng_accounts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('ng_accounts')
    .insert({ name: body.name, platform: body.platform, color: body.color, data: body.data })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
