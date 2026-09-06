export const CMS_CACHE_SECONDS = 60

export const CMS_TAGS = {
  editorial: 'cms:editorial',
  documents: 'cms:documents',
  sections: 'cms:sections',
  settings: 'cms:website-settings',
} as const

export function sectionTag(key: string): string {
  return `cms:section:${key}`.slice(0, 256)
}
