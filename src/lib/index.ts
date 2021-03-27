import TurndownService from 'turndown'

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService()
  turndownService.remove(['script'])
  return turndownService.turndown(html)
}

export const extractLink = (text: string): string | null => {
  const regex = /^\[[\w\s\d]+\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)$/
  const match = text.match(regex)
  if (match) {
    return match[1]
  }
  return null
}

export const getClickedChunk = (text: string, position: number): string => {
  if (position < 0 || position > text.length - 1) {
    return ''
  }
  if (text[position] === ' ') {
    return ''
  }

  let start = position
  while (start > 0) {
    start -= 1
    if (text[start] === ' ') {
      start += 1
      break
    }
  }
  let end = position
  while (end < text.length) {
    end += 1
    if (text[end] === ' ') {
      break
    }
  }

  return text.substring(start, end)
}
