import { htmlToMarkdown, validateUrl } from './index'

describe('htmlToMarkdown', () => {
  it('removes script tags', () => {
    const html = `
      <html>
        <script>alert('hello world');</script>
        <h1>hello world</h1>
      </html>
    `
    const md = htmlToMarkdown(html)
    expect(md).toBe('# hello world')
  })
})

describe('validateUrl', () => {
  it('returns true for a valid url', () => {
    expect(validateUrl('https://example.com')).toBe(true)
  })

  it('returns false for an invalid url', () => {
    expect(validateUrl('')).toBe(false)
    expect(validateUrl('hello world')).toBe(false)
    expect(validateUrl('http:meow')).toBe(false)
  })
})
