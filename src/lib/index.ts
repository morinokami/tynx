import TurndownService from 'turndown'

const turndownOptions: TurndownService.Options = {
  headingStyle: 'atx',
}

const turndownFilter: TurndownService.Filter = ['script']

export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService(turndownOptions)
  turndownService.remove(turndownFilter)
  return turndownService.turndown(html)
}

const allowedProtocols = ['http', 'https']

export const validateUrl = (urlStr: string): boolean => {
  try {
    const url = new URL(urlStr)
    return allowedProtocols.map((p) => `${p}:`).includes(url.protocol)
  } catch (err) {
    return false
  }
}
