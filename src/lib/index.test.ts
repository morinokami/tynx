import { HistoryType } from '../headless'
import { createHistoryList, htmlToMarkdown, validateUrl } from './index'

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
    expect(validateUrl('http//meow')).toBe(false)
  })
})

describe('createHistoryList', () => {
  it('returns history list', () => {
    const history: HistoryType[] = [
      {
        title: 'Google',
        url: 'https://google.com',
      },
      {
        title: 'Facebook',
        url: 'https://www.facebook.com',
      },
    ]
    const result = createHistoryList(history)
    expect(result).toBe(
      '<li><a href="https://google.com">Google</a></li><li><a href="https://www.facebook.com">Facebook</a></li>',
    )
  })
})
