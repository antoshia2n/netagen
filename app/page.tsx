export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createServerClient } from '@/lib/supabaseServer'
import NetaGen from '@/components/NetaGen'

export default async function Page() {
  const supabase = createServerClient()

  const { data: accounts } = await supabase
    .from('ng_accounts')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: ideas } = await supabase
    .from('ng_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <NetaGen
      initialAccounts={accounts ?? []}
      initialIdeas={ideas ?? []}
    />
  )
}
