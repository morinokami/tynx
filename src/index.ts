import CLI from './cli'
import Renderer from './renderer'
import Screen from './ui'
import { htmlToMarkdown } from './lib'

const main = async (): Promise<void> => {
  const cli = new CLI()
  const renderer = await Renderer.init()

  try {
    cli.validateUrl()
  } catch (err) {
    console.error(err.message)
    return
  }

  const htmlBody = await renderer.evaluate(cli.url)
  const md = htmlToMarkdown(htmlBody)
  const screen = new Screen(md, renderer.title, async () => {
    await renderer.close()
    return process.exit(0)
  })

  screen.run()
}

main()
