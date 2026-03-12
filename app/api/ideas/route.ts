import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('account_id')

  let query = supabase.from('ng_ideas').select('*').order('created_at', { ascending: false })
  if (accountId) query = query.eq('account_id', accountId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('ng_ideas')
    .insert({ account_id: body.account_id, title: body.title, category: body.category, fav: false, used: false })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
