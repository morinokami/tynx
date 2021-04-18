import { HistoryType } from '../headless'
import { turndownService } from './turndownService'

/**
 * Converts HTML to Markdown.
 * @param html HTML string.
 * @returns Converted Markdown string.
 */
export const htmlToMarkdown = (html: string): string => {
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

/**
 * Returns a list of HTML links as a string.
 * @param history Array of HistoryType.
 * @returns HTML list of links.
 */
export const createHistoryList = (history: HistoryType[]): string => {
  return history
    .map((h) => `<li><a href="${h.url}">${h.title}</a></li>`)
    .join('')
}
