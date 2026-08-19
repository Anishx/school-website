import { createNotificationRetryPostHandler } from '@/cms/notifications/retry-route'

export const runtime = 'nodejs'
export const POST = createNotificationRetryPostHandler()
