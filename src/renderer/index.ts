import puppeteer, { Browser, Page } from 'puppeteer'

class Renderer {
  private browser: Browser
  private page: Page
  private _title: string
  private content: string

  get title(): string {
    return this._title
  }

  constructor(browser: Browser, page: Page) {
    this.browser = browser
    this.page = page
    this._title = ''
    this.content = ''
  }

  static async init(): Promise<Renderer> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    return new Renderer(browser, page)
  }

  async evaluate(url: string): Promise<string> {
    await this.page.goto(url)
    this._title = await this.page.title()
    this.content = await this.page.content()
    return this.content
  }

  async close(): Promise<void> {
    await this.browser.close()
  }
}

export default Renderer
