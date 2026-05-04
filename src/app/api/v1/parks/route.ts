import { NextRequest } from 'next/server'
import { apiSuccess, apiError, getRequestUser, getClientIp } from '@/lib/api/helpers'
import { createClient } from '@/lib/supabase/server'
import { PARKS } from '@/lib/data'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getRequestUser(req)

    // Public endpoint — parks list is readable by anyone
    // If Supabase is configured, try DB first; fall back to static data
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isRealSupabase = url && !url.includes('placeholder')

    if (isRealSupabase) {
      let query = supabase.from('parks').select('*').eq('is_active', true)

      // Non-super-admins scoped to their park
      if (user && user.role !== 'super_admin' && user.park_id) {
        query = query.eq('id', user.park_id)
      }

      const { data, error } = await query.order('name')
      if (error) throw error

      return apiSuccess(data, { total: data.length })
    }

    // Demo fallback — shape data to match API schema
    const parks = PARKS.map(p => ({
      ...p,
      agency: p.state === 'New South Wales' ? 'NSW National Parks & Wildlife Service' : 'US National Park Service',
      country: p.state === 'New South Wales' ? 'AU' : 'US',
      state_region: p.state,
      is_active: true,
      created_at: new Date().toISOString(),
    }))

    return apiSuccess(parks, { total: parks.length })
  } catch (err) {
    console.error('[API] /parks GET error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to fetch parks', 500)
  }
}
