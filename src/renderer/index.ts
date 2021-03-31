import puppeteer, { Browser, Page } from 'puppeteer'

export type RenderResult = {
  title: string
  content: string
}

class Renderer {
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
    return new Renderer(browser, page)
  }

  async goto(url: string): Promise<void> {
    this.history.push(url)
    this.forward = []
    await this.page.goto(url)
  }

  async evaluate(): Promise<RenderResult> {
    const title = await this.page.title()
    const content = await this.page.evaluate(() => document.body.innerHTML)
    return { title, content }
  }

  async close(): Promise<void> {
    await this.browser.close()
  }

  async goForward(): Promise<boolean> {
    if (this.forward.length > 0) {
      this.history.push(this.forward.pop() as string)
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goForward(),
      ])
      return true
    }
    return false
  }

  async goBack(): Promise<boolean> {
    if (this.history.length > 1) {
      this.forward.push(this.history.pop() as string)
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
        this.page.goBack(),
      ])
      return true
    }
    return false
  }

  url(): URL {
    return new URL(this.page.url())
  }
}

export default Renderer
