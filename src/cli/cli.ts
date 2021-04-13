import meow from 'meow'

const usage = `
	Usage
	  $ tynx <url>

  Options
    --noCache Do not cache contents
`

export class CLI {
  private cli: meow.Result<meow.AnyFlags>
  private _url: string
  private _useCache: boolean

  get url(): string {
    return this._url
  }

  get useCache(): boolean {
    return this._useCache
  }

  constructor() {
    this.cli = meow(usage, {
      flags: {
        noCache: {
          type: 'boolean',
        },
      },
    })
    this._url = this.cli.input[0]
    this._useCache = !(this.cli.flags.noCache as boolean)
  }
}
