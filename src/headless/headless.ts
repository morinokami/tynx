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

  async goto(url: string): Promise<void> {
    this.history.push(url)
    this.forward = []
    if (!this.useCache || !this.cache.has(url)) {
      await this.page.goto(url)
    }
  }

  async reload(): Promise<void> {
    await this.page.reload()
  }

  async evaluate(): Promise<PageInfo> {
    const currentUrl = this.history[this.history.length - 1]
    if (this.useCache && this.cache.has(currentUrl)) {
      return this.cache.get(currentUrl) as PageInfo
    }

    const title = await this.page.title()
    const html = await this.page.evaluate(() => document.body.innerHTML)
    if (this.useCache) {
      this.cache.set(currentUrl, { title, html })
    }
    return { title, html }
  }

  async close(): Promise<void> {
    await this.browser.close()
  }

  async goForward(): Promise<void> {
    this.history.push(this.forward.pop() as string)
    if (!this.useCache) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goForward(),
      ])
    }
  }

  async goBack(): Promise<void> {
    this.forward.push(this.history.pop() as string)
    if (!this.useCache) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goBack(),
      ])
    }
  }

  canGoForward(): boolean {
    return this.forward.length > 0
  }

  canGoBack(): boolean {
    return this.history.length > 1
  }

  url(): URL {
    return new URL(this.page.url())
  }
}
