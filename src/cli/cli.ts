import meow from 'meow'

const usage = `
	Usage
	  $ tynx <url>
`

export class CLI {
  private cli: meow.Result<meow.AnyFlags>
  private _url: string

  get url(): string {
    return this._url
  }

  constructor() {
    this.cli = meow(usage)
    this._url = this.cli.input[0]
  }
}
