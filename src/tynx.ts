import { Headless, PageInfo } from './headless'
import { Screen } from './ui'
import { htmlToMarkdown, validateUrl } from './lib'

const loadingMsg = 'Loading...'

const help = 'file:help'
const helpContent = { title: 'Help', html: 'this is a help message' }

export const start = async (url: string, useCache: boolean): Promise<void> => {
  const browser = await Headless.init(useCache)

  const loadHelper = async (
    main: () => Promise<void>,
    reload = false,
  ): Promise<void> => {
    screen.clear()
    screen.setTitle(loadingMsg)
    await main()
    const page = await browser.evaluate(reload)
    await render(page)
  }
  const follow = async (url: string): Promise<void> => {
    if (url.startsWith('/')) {
      const { origin } = browser.url()
      url = `${origin}${url}`
    }
    if (validateUrl(url)) {
      loadHelper(async () => await browser.goto(url))
    }
  }
  const reload = async (): Promise<void> => {
    if (browser.rawUrl() === help) {
      return
    }
    loadHelper(async () => await browser.reload(), true)
  }
  const goForward = async (): Promise<void> => {
    if (browser.canGoForward()) {
      if (browser.peekForward() === help) {
        browser.appendToHistory(help)
        browser.popForward()
        screen.update(helpContent.title, helpContent.html)
      } else {
        loadHelper(async () => await browser.goForward())
      }
    }
  }
  const goBack = async (): Promise<void> => {
    if (browser.canGoBack()) {
      if (browser.peekBack() === help) {
        browser.appendToForwardHistory(help)
        browser.popHistory()
        screen.update(helpContent.title, helpContent.html)
      } else {
        loadHelper(async () => await browser.goBack())
      }
    }
  }
  const cleanUp = async (): Promise<void> => {
    screen.clear()
    await browser.close()
    process.exit(0)
  }
  const render = async (page: PageInfo): Promise<void> => {
    const md = htmlToMarkdown(page.html)
    screen.update(page.title, md)
  }
  const showHelp = async (): Promise<void> => {
    if (browser.rawUrl() === help) {
      return
    }
    loadHelper(async () => {
      browser.addToCache(help, helpContent)
      browser.appendToHistory(help)
      browser.clearForward()
      screen.update(helpContent.title, helpContent.html)
    })
  }

  await browser.goto(url)
  const { title, html } = await browser.evaluate()
  const md = htmlToMarkdown(html)
  const screen = new Screen(
    title,
    md,
    follow,
    reload,
    goForward,
    goBack,
    cleanUp,
    showHelp,
  )

  screen.run()
}
