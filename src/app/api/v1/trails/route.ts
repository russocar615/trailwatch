import { NextRequest } from 'next/server'
import { apiSuccess, apiError, getRequestUser, requireAuth, assertParkAccess, getClientIp } from '@/lib/api/helpers'
import { createClient } from '@/lib/supabase/server'
import { validate, TRAIL_STATUS_SCHEMA } from '@/lib/validation/schemas'
import { serverAudit } from '@/lib/audit/logger'
import { TRAILS } from '@/lib/data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parkId = searchParams.get('park_id')
    const status = searchParams.get('status')

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      let query = supabase.from('trails').select('*')
      if (parkId) query = query.eq('park_id', parkId)
      if (status) query = query.eq('status', status)
      const { data, error } = await query.order('name')
      if (error) throw error
      return apiSuccess(data, { total: data.length })
    }

    // Demo fallback
    let trails = [...TRAILS]
    if (parkId) trails = trails.filter(t => t.parkId === parkId)
    return apiSuccess(trails, { total: trails.length })
  } catch (err) {
    console.error('[API] /trails GET error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to fetch trails', 500)
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req, 'trail:update_status')
  if ('status' in authResult) return authResult
  const { user } = authResult

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return apiError('VALIDATION_ERROR', 'Trail ID is required', 400)

    const { valid, errors } = validate(updates, TRAIL_STATUS_SCHEMA)
    if (!valid) return apiError('VALIDATION_ERROR', 'Invalid trail data', 400, errors)

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      // Fetch current for audit diff
      const { data: current } = await supabase.from('trails').select('*').eq('id', id).single()

      if (!current) return apiError('NOT_FOUND', 'Trail not found', 404)
      if (!assertParkAccess(user, current.park_id))
        return apiError('FORBIDDEN', 'Access denied to this park', 403)

      const { data, error } = await supabase
        .from('trails')
        .update({ ...updates, updated_by: user.id, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await serverAudit(
        {
          action: 'trail.status_changed',
          entityType: 'trail',
          entityId: id,
          previousValue: { status: current.status, current_hikers: current.current_hikers },
          newValue: updates,
        },
        { userId: user.id, userEmail: user.email, userRole: user.role, parkId: current.park_id, ipAddress: getClientIp(req) }
      )

      return apiSuccess(data)
    }

    // Demo mode — just echo back
    return apiSuccess({ id, ...updates, updated_at: new Date().toISOString() })
  } catch (err) {
    console.error('[API] /trails PATCH error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to update trail', 500)
  }
}
