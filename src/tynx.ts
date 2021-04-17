import { promises as fs } from 'fs'
import url from 'url'

import { file } from 'tmp-promise'

import { Headless, PageInfo } from './headless'
import { Screen } from './ui'
import { createHistoryList, htmlToMarkdown, validateUrl } from './lib'

const HELP = `${__dirname}/static/help.html`
const HISTORY_TEMPLATE = `${__dirname}/static/history.html`
const HISTORY_EXTENSION = '.history.html'
const LOADING = 'Loading...'

export const start = async (
  initialUrl: string,
  useCache: boolean,
  version: string,
): Promise<void> => {
  const browser = await Headless.init(useCache, version)

  const loadHelper = async (
    main: () => Promise<void>,
    reload = false,
  ): Promise<void> => {
    screen.isLoading = true
    screen.clear()
    screen.setTitle(LOADING)
    await main()
    const page = await browser.evaluate(reload)
    await render(page)
    screen.isLoading = false
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
  const goForward = async (): Promise<void> => {
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
  const showHelp = async (): Promise<void> => {
    const helpUrl = url.pathToFileURL(HELP).href
    if (browser.rawUrl() === helpUrl) {
      return
    }

    loadHelper(async () => await browser.goto(helpUrl, false))
  }
  const showHistory = async (): Promise<void> => {
    if (browser.rawUrl().endsWith(HISTORY_EXTENSION)) {
      return
    }

    // create a file in tmp
    const { path } = await file()
    const newPath = `${path}${HISTORY_EXTENSION}`
    await fs.rename(path, newPath)

    // write history to the file
    const history = browser.getHistory()
    const template = await fs.readFile(HISTORY_TEMPLATE)
    await fs.writeFile(
      newPath,
      template.toString().replace('HISTORY', createHistoryList(history)),
    )

    // goto the file
    loadHelper(
      async () => await browser.goto(url.pathToFileURL(newPath).href, false),
    )
  }
  const render = async (page: PageInfo): Promise<void> => {
    const md = htmlToMarkdown(page.html)
    screen.update(page.title, md)
  }

  await browser.goto(initialUrl)
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
    showHistory,
  )

  screen.run()
}
