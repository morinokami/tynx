import blessed from 'blessed'
import stripAnsi from 'strip-ansi'
import { boxOptions, cursorOptions, inputFieldOptions } from './blessedOptions'

const regexMarkdownHeading = /#{1,6} .+$/gm
const regexMarkdownLink = /\[([^[]+)\]\(([^)]+)\)/gm

export type CursorPosition = {
  top: number
  left: number
}

export class Screen {
  private screen: blessed.Widgets.Screen
  private box: blessed.Widgets.BoxElement
  private cursorTop: number
  private cursorLeft: number
  private cursor: blessed.Widgets.BoxElement
  private follow: (url: string) => Promise<void>
  private reload: () => Promise<void>
  private goForward: () => Promise<void>
  private goBack: () => Promise<void>
  private exit: () => Promise<void>

  constructor(
    title: string,
    md: string,
    follow: (url: string) => Promise<void>,
    reload: () => Promise<void>,
    goForward: () => Promise<void>,
    goBack: () => Promise<void>,
    exit: () => Promise<void>,
  ) {
    this.screen = blessed.screen({
      smartCSR: true,
      forceUnicode: true,
      fullUnicode: true,
    })
    this.screen.title = title
    this.box = blessed.box(
      Object.assign({}, boxOptions, {
        content: md
          .replace(regexMarkdownLink, `{underline}${'$&'}{/underline}`)
          .replace(regexMarkdownHeading, `{bold}${'$&'}{/bold}`),
      }),
    )
    this.screen.append(this.box)
    this.cursorTop = 0
    this.cursorLeft = 0
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.cursorTop,
        left: this.cursorLeft,
      }),
    )
    this.follow = follow
    this.reload = reload
    this.goForward = goForward
    this.goBack = goBack
    this.exit = exit

    this.bindListeners()
  }

  private bindListeners(): void {
    this.box.key(
      [
        'f',
        'r',
        '[',
        ']',
        'e',
        'q',
        'h',
        'j',
        'k',
        'l',
        'g',
        'S-g',
        '0',
        '$',
        'C-f',
        'C-b',
      ],
      async (_, key) => {
        if (key.full === 'f') {
          // Follow link
          await this.followLinkUnderCursor()
        } else if (key.full === 'r') {
          // Reload
          await this.reload()
        } else if (key.full === '[') {
          // Go back
          await this.goBack()
        } else if (key.full === ']') {
          // Go forward
          await this.goForward()
        } else if (key.full === 'e') {
          // Follow input
          await this.followInput()
        } else if (key.full === 'q') {
          // Quit
          this.exit()
        } else {
          // Update cursor position
          this.cursor.detach()
          this.updateCoordinate(key.full)
          this.renderCursor()
          this.screen.render()
        }
      },
    )

    this.box.on('click', async (mouse) => {
      // move the cursor
      this.cursor.detach()
      const { x, y } = mouse
      this.cursorTop = this.box.childBase + y - 1
      this.cursorLeft = x - 1
      this.renderCursor()
      this.screen.render()

      // check if the clicked chunk is a markdown link
      await this.followLinkUnderCursor()
    })
  }

  private updateCoordinate(input: string): void {
    if (input === 'j' || input === 'k') {
      this.cursorTop = this.nextCursorPosition(
        this.cursorTop,
        input === 'j',
        this.box.getScrollHeight() as number,
        1,
      )
      this.box.scrollTo(this.cursorTop)
    } else if (input === 'h' || input === 'l') {
      this.cursorLeft = this.nextCursorPosition(
        this.cursorLeft,
        input === 'l',
        this.box.width as number,
        3,
      )
    } else if (input === 'g') {
      this.cursorTop = 0
      this.cursorLeft = 0
      this.box.scrollTo(this.cursorTop)
    } else if (input === 'S-g') {
      this.cursorTop = this.box.getScreenLines().length - 1
      this.cursorLeft = 0
      this.box.scrollTo(this.cursorTop)
    } else if (input === '0') {
      this.cursorLeft = 0
    } else if (input === '$') {
      this.cursorLeft = (this.box.width as number) - 3
    } else if (input === 'C-f') {
      this.cursorTop += (this.box.height as number) - 2
      if (this.cursorTop > this.box.getScrollHeight()) {
        this.cursorTop = this.box.getScrollHeight() - 1
      }
      this.box.scrollTo(this.box.getScrollHeight())
      this.box.scrollTo(this.cursorTop)
    } else if (input === 'C-b') {
      this.cursorTop -= (this.box.height as number) - 1
      if (this.cursorTop < 0) {
        this.cursorTop = 0
      }
      this.box.scrollTo(0)
      this.box.scrollTo(this.cursorTop)
    }
  }

  private nextCursorPosition(
    current: number,
    forward: boolean,
    maxLength: number,
    adjustment: number,
  ): number {
    let position = current + (forward ? 1 : -1)
    position = position < 0 ? 0 : position
    position =
      position > maxLength - adjustment ? maxLength - adjustment : position

    return position
  }

  private renderCursor(): void {
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.cursorTop,
        left: this.cursorLeft,
      }),
    )
  }

  private async followInput(): Promise<void> {
    const input = blessed.textbox(inputFieldOptions)
    this.screen.append(input)
    this.screen.render()
    input.focus()
    input.readInput(async (err, value) => {
      input.destroy()
      if (!err && value?.length) {
        await this.follow(value as string)
      }
      this.screen.render()
    })
  }

  private async followLinkUnderCursor(): Promise<void> {
    // check if the chunk under cursor is a markdown link
    const lines = this.box.getScreenLines()
    if (this.cursorTop >= lines.length) {
      return
    }
    const before = lines.slice(0, this.cursorTop)
    const cursorIndex = stripAnsi(before.join('')).length + this.cursorLeft
    const cursorLine = lines[this.cursorTop]
    if (this.cursorLeft <= cursorLine.length) {
      const text = stripAnsi(lines.join(''))
      let match = regexMarkdownLink.exec(text)
      while (match) {
        const start = match.index
        const end = start + match[0].length
        if (start <= cursorIndex && cursorIndex < end) {
          // jump to the link destination
          await this.follow(match[2])
          break
        }
        match = regexMarkdownLink.exec(text)
      }
    }
  }

  run(): void {
    this.screen.render()
  }

  clear(): void {
    this.cursor.detach()
    this.box.content = ''
    this.screen.title = ''
    this.screen.render()
  }

  update(title: string, md: string, cursorPosition?: CursorPosition): void {
    this.screen.title = title
    this.box = blessed.box(
      Object.assign({}, boxOptions, {
        content: md
          .replace(regexMarkdownLink, `{underline}${'$&'}{/underline}`)
          .replace(regexMarkdownHeading, `{bold}${'$&'}{/bold}`),
      }),
    )
    this.screen.append(this.box)
    if (cursorPosition) {
      this.cursorTop = cursorPosition.top
      this.cursorLeft = cursorPosition.left
    } else {
      this.cursorTop = 0
      this.cursorLeft = 0
    }
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.cursorTop,
        left: this.cursorLeft,
      }),
    )
    this.bindListeners()
    this.screen.render()
  }

  setTitle(title: string): void {
    this.screen.title = title
  }
}
