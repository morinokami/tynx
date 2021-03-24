import blessed from 'blessed'

import CLI from './cli'
import Renderer from './renderer'
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

  const screen = blessed.screen({
    smartCSR: true,
  })
  screen.title = renderer.title
  const box = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    content: md,
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0',
      },
    },
  })
  screen.append(box)
  let top = 0
  let left = 0
  const cursorOptions = {
    parent: box,
    width: 1,
    height: 1,
    style: {
      fg: 'white',
      bg: 'white',
    },
  }
  let cursor = blessed.box(Object.assign({}, cursorOptions, { top, left }))
  box.key(['h', 'j', 'k', 'l'], (ch) => {
    cursor.detach()
    if (ch === 'j' || ch === 'k') {
      top += ch === 'j' ? 1 : -1
      top = top < 0 ? 0 : top
      top = top > (box.height as number) - 3 ? (box.height as number) - 3 : top
    } else if (ch === 'h' || ch === 'l') {
      left += ch === 'l' ? 1 : -1
      left = left < 0 ? 0 : left
      left = left > (box.width as number) - 3 ? (box.width as number) - 3 : left
    }
    cursor = blessed.box(Object.assign({}, cursorOptions, { top, left }))
    screen.render()
  })
  screen.key(['escape', 'q', 'C-c'], async () => {
    await renderer.close()
    return process.exit(0)
  })
  screen.render()
}

main()
