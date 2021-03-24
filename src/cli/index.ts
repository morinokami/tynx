import meow from 'meow'
import validUrl from 'valid-url'

const usage = `
	Usage
	  $ tynx <url>
`

class CLI {
  private cli: meow.Result<meow.AnyFlags>
  private _url: string

  get url(): string {
    return this._url
  }

  constructor() {
    this.cli = meow(usage)
    this._url = this.cli.input[0]
  }

  validateUrl(): void {
    if (!this.url) {
      throw new Error('URL not specified')
    }
    if (!validUrl.isWebUri(this._url)) {
      throw new Error(`Not a valid URL: ${this._url}`)
    }
  }
}

export default CLI
