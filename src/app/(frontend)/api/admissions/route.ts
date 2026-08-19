import { createAdmissionPostHandler } from '@/cms/admissions/public-route'

export const runtime = 'nodejs'
export const POST = createAdmissionPostHandler()
