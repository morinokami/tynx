import axios from 'axios'
import meow from 'meow'
import TurndownService from 'turndown'

const cli = meow()

const url = cli.input[0]
// validate url here
axios.get(url).then((response) => {
  const html = response.data
  // validate html here
  const turndownService = new TurndownService()
  const md = turndownService.turndown(html)
  console.log(md)
})
