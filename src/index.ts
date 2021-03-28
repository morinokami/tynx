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

  const follow = async (url: string): Promise<void> => {
    if (url.startsWith('/')) {
      const { origin } = renderer.url()
      url = `${origin}${url}`
    }
    await renderer.goto(url)
    render()
  }
  const goFoward = async (): Promise<void> => {
    await renderer.goForward()
    render()
  }
  const goBack = async (): Promise<void> => {
    await renderer.goBack()
    render()
  }
  const cleanUp = async (): Promise<void> => {
    await renderer.close()
    process.exit(0)
  }
  const render = async () => {
    const { title, content } = await renderer.evaluate()
    const md = htmlToMarkdown(content)
    screen.update(title, md)
  }

  await renderer.goto(cli.url)
  const { title, content } = await renderer.evaluate()
  const md = htmlToMarkdown(content)
  const screen = new Screen(title, md, follow, goFoward, goBack, cleanUp)

  screen.run()
}

main()
