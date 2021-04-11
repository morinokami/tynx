import TurndownService from 'turndown'

const turndownOptions: TurndownService.Options = {
  headingStyle: 'atx',
}

const turndownFilter: TurndownService.Filter = ['script']

/**
 * Converts HTML to Markdown.
 * @param html HTML string.
 * @returns Converted Markdown string.
 */
export const htmlToMarkdown = (html: string): string => {
  const turndownService = new TurndownService(turndownOptions)
  turndownService.remove(turndownFilter)
  return turndownService.turndown(html)
}

const allowedProtocols = ['http', 'https']

/**
 * Checks if a string is a valid url.
 * @param urlStr String to be tested.
 * @returns `true` if string is valid url, otherwise `false`.
 */
export const validateUrl = (urlStr: string): boolean => {
  try {
    const url = new URL(urlStr)
    return allowedProtocols.map((p) => `${p}:`).includes(url.protocol)
  } catch (err) {
    return false
  }
}
