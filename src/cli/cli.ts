import meow from 'meow'

export class CLI {
  private cli: meow.Result<meow.AnyFlags>
  private _url: string
  private _useCache: boolean
  private _version: string

  get url(): string {
    return this._url
  }

  get useCache(): boolean {
    return this._useCache
  }

  get version(): string {
    return this._version
  }

  constructor(usage = '') {
    this.cli = meow(usage, {
      flags: {
        noCache: {
          type: 'boolean',
        },
      },
    })
    this._url = this.cli.input[0]
    this._useCache = !(this.cli.flags.noCache as boolean)
    this._version = this.cli.pkg.version as string
  }
}
