#!/usr/bin/env node

import { CLI } from './cli'
import { validateUrl } from './lib'
import * as tynx from './tynx'

const main = async (): Promise<void> => {
  const cli = new CLI()
  if (!cli.url) {
    console.error('URL not specified')
  } else if (!validateUrl(cli.url)) {
    console.error(`Not a valid URL: ${cli.url}`)
  } else {
    tynx.start(cli.url, cli.useCache)
  }
}

main()
