import TurndownService from 'turndown'

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService()
  turndownService.remove(['script'])
  return turndownService.turndown(html)
}
