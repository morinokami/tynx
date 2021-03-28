import puppeteer, { Browser, Page } from 'puppeteer'

export type RenderResult = {
  title: string
  content: string
}

class Renderer {
  private browser: Browser
  private page: Page

  constructor(browser: Browser, page: Page) {
    this.browser = browser
    this.page = page
  }

  static async init(): Promise<Renderer> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    return new Renderer(browser, page)
  }

  async goto(url: string): Promise<void> {
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

  async goForward(): Promise<void> {
    await this.page.goForward()
  }

  async goBack(): Promise<void> {
    await this.page.goBack()
  }

  url(): URL {
    return new URL(this.page.url())
  }
}

export default Renderer
