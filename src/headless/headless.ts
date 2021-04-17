import puppeteer, { Browser, Page } from 'puppeteer'

export type HistoryType = {
  title: string
  url: string
}

export type PageInfo = {
  title: string
  html: string
}

export class Headless {
  private browser: Browser
  private page: Page
  private history: string[]
  private forward: string[]
  private readonly useCache: boolean
  private cache: Map<string, PageInfo>

  constructor(browser: Browser, page: Page, useCache: boolean) {
    this.browser = browser
    this.page = page
    this.history = []
    this.forward = []
    this.useCache = useCache
    this.cache = new Map()
  }

  static async init(useCache: boolean, version: string): Promise<Headless> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.setUserAgent(`tynx/${version}`)
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (
        ['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1
      ) {
        request.abort()
      } else {
        request.continue()
      }
    })
    return new Headless(browser, page, useCache)
  }

  /**
   * Navigates to the page referenced by the specified url.
   * @param url URL to navigate to.
   */
  async goto(url: string, clearForward = true): Promise<void> {
    if (
      this.history.length > 0 &&
      this.history[this.history.length - 1].startsWith('file')
    ) {
      this.history.pop()
    }

    this.history.push(url)
    if (clearForward) {
      this.forward = []
    }
    if (!this.useCache || !this.cache.has(url)) {
      await this.page.goto(url)
    }
  }

  /**
   * Reloads the current page.
   */
  async reload(): Promise<void> {
    await this.page.goto(this.history[this.history.length - 1])
  }

  /**
   * Evaluates the current page and returns the title and html as a `Promise<PageInfo>`.
   * If the `useCache` options is set to `true` when the browser is initialized,
   * it stores the result as a cache and returns it.
   * @param reloaded Page was reloaded right before it's called.
   * If it's set to `true`, cache will be updated. Defaults to `false`.
   * @returns title and html as `Promise<PageInfo>`.
   */
  async evaluate(reloaded = false): Promise<PageInfo> {
    const currentUrl = this.history[this.history.length - 1]
    if (this.useCache && this.cache.has(currentUrl) && !reloaded) {
      return this.cache.get(currentUrl) as PageInfo
    }

    const title = await this.page.title()
    const html = await this.page.evaluate(() => document.body.innerHTML)
    if (this.useCache) {
      this.cache.set(currentUrl, { title, html })
    }
    return { title, html }
  }

  /**
   * Closes the browser.
   */
  async close(): Promise<void> {
    await this.browser.close()
  }

  /**
   * Navigates to the next page in history.
   */
  async goForward(): Promise<void> {
    if (this.history[this.history.length - 1].startsWith('file')) {
      this.history.pop()
    }
    this.history.push(this.forward.pop() as string)
    if (!this.useCache) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goForward(),
      ])
    }
  }

  /**
   * Navigates to the previous page in history.
   */
  async goBack(): Promise<void> {
    const url = this.history.pop() as string
    if (!url.startsWith('file')) {
      this.forward.push(url)
    }
    if (!this.useCache) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goBack(),
      ])
    }
  }

  /**
   * Checks if the browser can navigate to the next page in history.
   * @returns `true` if browser can navigate to next page, otherwise `false`.
   */
  canGoForward(): boolean {
    return (
      this.forward.length > 0 &&
      !this.forward[this.forward.length - 1].startsWith('file')
    )
  }

  /**
   * Checks if the browser can navigate to the previous page in history.
   * @returns `true` if browser can navigate to previous page, otherwise `false`.
   */
  canGoBack(): boolean {
    return this.history.length > 1
  }

  /**
   * Returns the `URL` object referencing the current page.
   * @returns `URL` object of current page.
   */
  url(): URL {
    return new URL(this.rawUrl())
  }

  /**
   * Return the url string corresponding to the current page.
   * @returns url of current page.
   */
  rawUrl(): string {
    return this.history[this.history.length - 1]
  }

  /**
   * Returns an array of `HistoryType`, which consists of a title and a url.
   * @returns `HistoryType` array.
   */
  getHistory(): HistoryType[] {
    const urls = this.history.concat(this.forward.reverse())
    return urls.map((url) => {
      const title = this.cache.get(url)?.title as string
      return {
        url,
        title,
      }
    })
  }
}
