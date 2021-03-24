import TurndownService from 'turndown'

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService()
  return turndownService.turndown(html)
}
