import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function PUT(req, context) {
  const supabase = createServerClient()
  const { id } = await context.params
  const body = await req.json()
  const { data, error } = await supabase
    .from('ng_ideas')
    .update({ fav: body.fav, used: body.used })
    .eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req, context) {
  const supabase = createServerClient()
  const { id } = await context.params
  const { error } = await supabase.from('ng_ideas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
