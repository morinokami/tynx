#!/usr/bin/env node

import { CLI } from './cli'
import { validateUrl } from './lib'
import * as tynx from './tynx'

const usage = `
  Usage
    $ tynx <url>

  Options
    --noCache Do not cache contents
`

const main = async (): Promise<void> => {
  const cli = new CLI(usage)
  if (!cli.url) {
    console.log(usage)
  } else if (!validateUrl(cli.url)) {
    console.error(`Not a valid URL: ${cli.url}`)
  } else {
    tynx.start(cli.url, cli.useCache, cli.version)
  }
}

main()
