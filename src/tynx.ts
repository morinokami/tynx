import { Renderer } from './renderer'
import Screen from './ui'
import { htmlToMarkdown, validateUrl } from './lib'

export const start = async (url: string): Promise<void> => {
  const renderer = await Renderer.init()

  const follow = async (url: string): Promise<void> => {
    if (url.startsWith('/')) {
      const { origin } = renderer.url()
      url = `${origin}${url}`
    }
    if (validateUrl(url)) {
      screen.clear()
      await renderer.goto(url)
    }
    await render()
  }
  const reload = async (): Promise<void> => {
    screen.clear()
    await renderer.reload()
    await render()
  }
  const goFoward = async (): Promise<void> => {
    if (renderer.canGoForward()) {
      screen.clear()
      await renderer.goForward()
      await render()
    }
  }
  const goBack = async (): Promise<void> => {
    if (renderer.canGoBack()) {
      screen.clear()
      await renderer.goBack()
      await render()
    }
  }
  const cleanUp = async (): Promise<void> => {
    await renderer.close()
    process.exit(0)
  }
  const render = async (): Promise<void> => {
    const { title, content } = await renderer.evaluate()
    const md = htmlToMarkdown(content)
    screen.update(title, md)
  }

  await renderer.goto(url)
  const { title, content } = await renderer.evaluate()
  const md = htmlToMarkdown(content)
  const screen = new Screen(
    title,
    md,
    follow,
    reload,
    goFoward,
    goBack,
    cleanUp,
  )

  screen.run()
}
