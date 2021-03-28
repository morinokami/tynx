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
  const follow = async (url: string) => {
    if (url.startsWith('/')) {
      const { origin } = renderer.url()
      url = `${origin}${url}`
    }
    const htmlBody = await renderer.evaluate(url)
    const md = htmlToMarkdown(htmlBody)
    screen.update(renderer.title, md)
  }
  const cleanUp = async () => {
    await renderer.close()
    return process.exit(0)
  }
  const screen = new Screen(renderer.title, md, follow, cleanUp)

  screen.run()
}

main()
