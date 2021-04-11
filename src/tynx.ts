import { Headless, PageInfo } from './headless'
import { Screen } from './ui'
import { htmlToMarkdown, validateUrl } from './lib'

const loadingMsg = 'Loading...'

export const start = async (url: string, useCache: boolean): Promise<void> => {
  const browser = await Headless.init(useCache)

  const follow = async (url: string): Promise<void> => {
    if (url.startsWith('/')) {
      const { origin } = browser.url()
      url = `${origin}${url}`
    }
    if (validateUrl(url)) {
      screen.clear()
      screen.setTitle(loadingMsg)
      await browser.goto(url)
    }
    const page = await browser.evaluate()
    await render(page)
  }
  const reload = async (): Promise<void> => {
    screen.clear()
    screen.setTitle(loadingMsg)
    await browser.reload()
    const page = await browser.evaluate(true)
    await render(page)
  }
  const goFoward = async (): Promise<void> => {
    if (browser.canGoForward()) {
      screen.clear()
      screen.setTitle(loadingMsg)
      await browser.goForward()
      const page = await browser.evaluate()
      await render(page)
    }
  }
  const goBack = async (): Promise<void> => {
    if (browser.canGoBack()) {
      screen.clear()
      screen.setTitle(loadingMsg)
      await browser.goBack()
      const page = await browser.evaluate()
      await render(page)
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

  await browser.goto(url)
  const { title, html } = await browser.evaluate()
  const md = htmlToMarkdown(html)
  const screen = new Screen(
    title,
    md,
    follow,
    reload,
    goFoward,
    goBack,
    cleanUp,
  )

  screen.run()
}
