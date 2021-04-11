import { Headless } from './headless'
import { Screen } from './ui'
import { htmlToMarkdown, validateUrl } from './lib'

const loadingMsg = 'Loading...'

export const start = async (url: string): Promise<void> => {
  const browser = await Headless.init()

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
    await render()
  }
  const reload = async (): Promise<void> => {
    screen.clear()
    screen.setTitle(loadingMsg)
    await browser.reload()
    await render()
  }
  const goFoward = async (): Promise<void> => {
    if (browser.canGoForward()) {
      screen.clear()
      screen.setTitle(loadingMsg)
      await browser.goForward()
      await render()
    }
  }
  const goBack = async (): Promise<void> => {
    if (browser.canGoBack()) {
      screen.clear()
      screen.setTitle(loadingMsg)
      await browser.goBack()
      await render()
    }
  }
  const cleanUp = async (): Promise<void> => {
    screen.clear()
    await browser.close()
    process.exit(0)
  }
  const render = async (): Promise<void> => {
    const { title, html } = await browser.evaluate()
    const md = htmlToMarkdown(html)
    screen.update(title, md)
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
