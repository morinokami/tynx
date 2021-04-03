import puppeteer, { Browser, Page } from 'puppeteer'

export type RenderResult = {
  title: string
  content: string
}

export class Renderer {
  private browser: Browser
  private page: Page
  private history: string[]
  private forward: string[]

  constructor(browser: Browser, page: Page) {
    this.browser = browser
    this.page = page
    this.history = []
    this.forward = []
  }

  static async init(): Promise<Renderer> {
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
    return new Renderer(browser, page)
  }

  async goto(url: string): Promise<void> {
    this.history.push(url)
    this.forward = []
    await this.page.goto(url)
  }

  async reload(): Promise<void> {
    await this.page.reload()
  }

  async evaluate(): Promise<RenderResult> {
    const title = await this.page.title()
    const content = await this.page.evaluate(() => document.body.innerHTML)
    return { title, content }
  }

  async close(): Promise<void> {
    await this.browser.close()
  }

  async goForward(): Promise<void> {
    this.history.push(this.forward.pop() as string)
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
      this.page.goForward(),
    ])
  }

  async goBack(): Promise<void> {
    this.forward.push(this.history.pop() as string)
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
      this.page.goBack(),
    ])
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
