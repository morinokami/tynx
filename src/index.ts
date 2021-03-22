import meow from 'meow'
import puppeteer from 'puppeteer'
import TurndownService from 'turndown'
import validUrl from 'valid-url'

const cli = meow()

const url = cli.input[0]
if (!validUrl.isWebUri(url)) {
  console.log(`Not a valid url: ${url}`)
  process.exit(1)
}

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  const htmlBody = await page.content()

  const turndownService = new TurndownService()
  const md = turndownService.turndown(htmlBody)
  console.log(md)

  await browser.close()
})()
