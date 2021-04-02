import TurndownService from 'turndown'
import validUrl from 'valid-url'

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService()
  turndownService.remove(['script'])
  return turndownService.turndown(html)
}

export const validateUrl = (url: string): boolean => {
  return !!validUrl.isWebUri(url)
}
