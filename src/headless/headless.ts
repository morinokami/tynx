import puppeteer, { Browser, Page } from 'puppeteer'

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

  static async init(useCache: boolean): Promise<Headless> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
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
  async goto(url: string): Promise<void> {
    this.history.push(url)
    this.forward = []
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
    this.forward.push(this.history.pop() as string)
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
    return this.forward.length > 0
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
   * @returns `URL` object.
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
   * Appends the spceifed url to history array.
   * @param url Url to append to history.
   */
  appendToHistory(url: string): void {
    this.history.push(url)
  }

  /**
   * Appends the specified url to forward array.
   * @param url Url to append to forward.
   */
  appendToForwardHistory(url: string): void {
    this.forward.push(url)
    console.log(this.forward)
  }

  /**
   * Removes the last element from the history array and returns it.
   * @returns Last element of history.
   */
  popHistory(): string | undefined {
    return this.history.pop()
  }

  /**
   * Removes the last element from the forward array and returns it.
   * @returns Last element of forward.
   */
  popForward(): string | undefined {
    return this.forward.pop()
  }

  /**
   * Clears the forward array.
   */
  clearForward(): void {
    this.forward = []
  }

  /**
   * Adds a `PageInfo` object to the cache.
   * @param key Key of cache.
   * @param pageInfo Title and markdown content of page.
   */
  addToCache(key: string, pageInfo: PageInfo): void {
    this.cache.set(key, pageInfo)
  }

  /**
   * Returns the url of the next page in history.
   * @returns Url of next page if exists, otherwise empty string.
   */
  peekForward(): string {
    if (this.forward.length > 0) {
      return this.forward[this.forward.length - 1]
    }
    return ''
  }

  /**
   * Returns the url of the previous page in history.
   * @returns Url of previous page if exists, otherwise empty string.
   */
  peekBack(): string {
    if (this.history.length > 1) {
      return this.history[this.history.length - 2]
    }
    return ''
  }
}
