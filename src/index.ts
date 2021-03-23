import blessed from 'blessed'
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

  const screen = blessed.screen({
    smartCSR: true,
  })
  screen.title = await page.title()
  const box = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    content: md,
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0',
      },
      hover: {
        bg: 'green',
      },
    },
  })
  screen.append(box)
  screen.key(['escape', 'q', 'C-c'], async () => {
    await browser.close()
    return process.exit(0)
  })
  screen.render()
})()
