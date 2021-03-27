import { extractLink, getClickedChunk } from './index'

describe('extractLink', () => {
  it('extracts url of markdown link', () => {
    const text = '[foo](https://example.com)'
    const result = extractLink(text)
    expect(result).toBe('https://example.com')
  })

  it('returns null if not matched', () => {
    const text = 'hello world'
    const result = extractLink(text)
    expect(result).toBeNull()
  })
})

describe('getClickedElement', () => {
  it('returns space-separated characters on position', () => {
    let text = 'hello world'
    let position = 2
    let result = getClickedChunk(text, position)
    expect(result).toBe('hello')

    text = 'hello world again'
    position = 7
    result = getClickedChunk(text, position)
    expect(result).toBe('world')

    text = 'a: [b](https://example.com)'
    position = 3
    result = getClickedChunk(text, position)
    expect(result).toBe('[b](https://example.com)')
  })

  it('resturns empty string if position out of range', () => {
    const text = 'hello world'
    expect(getClickedChunk(text, -1)).toBe('')
    expect(getClickedChunk(text, 99)).toBe('')
  })

  it('returns empty string if position points to a space', () => {
    const text = 'hello world'
    const position = 5
    const result = getClickedChunk(text, position)
    expect(result).toBe('')
  })
})
