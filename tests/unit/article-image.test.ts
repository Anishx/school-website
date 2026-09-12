import { describe, expect, it } from 'vitest'
import { isExternalArticleImage, validateArticleImageURL } from '../../src/cms/public/article-image'

describe('article image URLs', () => {
  it.each(['https://images.example.com/school.jpg', 'https://images.example.com/photo?id=123', ' https://images.example.com/photo.png '])('accepts a direct HTTPS URL: %s', (url) => {
    expect(isExternalArticleImage(url)).toBe(true)
    expect(validateArticleImageURL(url)).toBe(true)
  })
  it.each(['http://example.com/a.jpg', 'javascript:alert(1)', 'data:image/png;base64,a', '//example.com/a.jpg', '/\\example.com/a.jpg', 'https://user:password@example.com/a.jpg', 'invalid'])('rejects invalid image URL: %s', (url) => {
    expect(isExternalArticleImage(url)).toBe(false)
    expect(validateArticleImageURL(url)).not.toBe(true)
  })
  it('preserves local migrated images and optional uploads', () => {
    expect(validateArticleImageURL('/images/campus/entrance.jpg')).toBe(true)
    expect(isExternalArticleImage('/images/campus/entrance.jpg')).toBe(false)
    expect(validateArticleImageURL(undefined)).toBe(true)
    expect(validateArticleImageURL('')).toBe(true)
  })
})
