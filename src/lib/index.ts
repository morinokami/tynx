import TurndownService from 'turndown'
import validUrl from 'valid-url'

const turndownOptions: TurndownService.Options = {
  headingStyle: 'atx',
}

const turndownFilter: TurndownService.Filter = ['script']

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService(turndownOptions)
  turndownService.remove(turndownFilter)
  return turndownService.turndown(html)
}

export const validateUrl = (url: string): boolean => {
  return !!validUrl.isWebUri(url)
}
