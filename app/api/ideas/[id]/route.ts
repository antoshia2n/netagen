// @ts-nocheck
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('ng_ideas')
    .update({ fav: body.fav, used: body.used })
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { error } = await supabase.from('ng_ideas').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
