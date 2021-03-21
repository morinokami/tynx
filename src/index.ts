import axios from 'axios'
import meow from 'meow'
import TurndownService from 'turndown'
import validUrl from 'valid-url'

const cli = meow()

const url = cli.input[0]
if (!validUrl.isWebUri(url)) {
  console.log(`Not a valid url: ${url}`)
  process.exit(1)
}

axios.get(url).then((response) => {
  const contentType = response.headers['content-type']
  if (!contentType?.includes('text/html')) {
    console.log('response not html')
    process.exit(1)
  }
  const html = response.data
  // eval js here
  const turndownService = new TurndownService()
  const md = turndownService.turndown(html)
  console.log(md)
})
