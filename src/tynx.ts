import { Headless, PageInfo } from './headless'
import { Screen } from './ui'
import { htmlToMarkdown, validateUrl } from './lib'

const loadingMsg = 'Loading...'

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
    loadHelper(async () => await browser.reload(), true)
  }
  const goFoward = async (): Promise<void> => {
    if (browser.canGoForward()) {
      loadHelper(async () => await browser.goForward())
    }
  }
  const goBack = async (): Promise<void> => {
    if (browser.canGoBack()) {
      loadHelper(async () => await browser.goBack())
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
