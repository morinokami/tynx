import blessed from 'blessed'
import stripAnsi from 'strip-ansi'
import { boxOptions, cursorOptions, inputFieldOptions } from './blessedOptions'

const regexMarkdownHeading = /#{1,6} .+$/gm
const regexMarkdownLink = /\[([^[]+)\]\(([^)]+)\)/gm

/**
 * The Screen class renders markdown contents to the screen.
 */
export class Screen {
  private screen: blessed.Widgets.Screen
  private box: blessed.Widgets.BoxElement
  private cursorTop: number
  private cursorLeft: number
  private cursor: blessed.Widgets.BoxElement
  private cbFollow: (url: string) => Promise<void>
  private cbReload: () => Promise<void>
  private cbGoForward: () => Promise<void>
  private cbGoBack: () => Promise<void>
  private cbExit: () => Promise<void>
  private cbShowHelp: () => Promise<void>
  private cbShowHistory: () => Promise<void>
  isLoading: boolean

  /**
   * @param title Initial title.
   * @param md Initial Markdown content.
   * @param follow Called when user enters url or clicks link.
   * @param reload Called when user presses `r`.
   * @param goForward Called when user presses `[`.
   * @param goBack Called when user presses `]`.
   * @param exit Called when user presses `e`.
   * @param showHelp Called when user presses `?`.
   * @param showHistory Called when user presses `H`.
   */
  constructor(
    title: string,
    md: string,
    follow: (url: string) => Promise<void>,
    reload: () => Promise<void>,
    goForward: () => Promise<void>,
    goBack: () => Promise<void>,
    exit: () => Promise<void>,
    showHelp: () => Promise<void>,
    showHistory: () => Promise<void>,
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
    this.cbFollow = follow
    this.cbReload = reload
    this.cbGoForward = goForward
    this.cbGoBack = goBack
    this.cbExit = exit
    this.cbShowHelp = showHelp
    this.cbShowHistory = showHistory

    this.bindListeners()
    this.isLoading = false
  }

  private bindListeners(): void {
    this.box.key(
      [
        'f',
        'e',
        'r',
        '[',
        ']',
        'q',
        '?',
        'h',
        'S-h',
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
        if (this.isLoading) {
          return
        }
        if (key.full === 'f') {
          // Follow link
          await this.followLinkUnderCursor()
        } else if (key.full === 'e') {
          // Follow input
          await this.followInput()
        } else if (key.full === 'r') {
          // Reload
          await this.cbReload()
        } else if (key.full === ']') {
          // Go forward
          await this.cbGoForward()
        } else if (key.full === '[') {
          // Go back
          await this.cbGoBack()
        } else if (key.full === 'q') {
          // Quit
          this.cbExit()
        } else if (key.full === '?') {
          // Show help
          this.cbShowHelp()
        } else if (key.full === 'S-h') {
          // Show history
          this.cbShowHistory()
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
        await this.cbFollow(value as string)
      }
      this.screen.render()
    })
  }

  private async followLinkUnderCursor(): Promise<void> {
    // check if the chunk under the cursor is a markdown link
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
          await this.cbFollow(match[2])
          break
        }
        match = regexMarkdownLink.exec(text)
      }
    }
  }

  /**
   * Initializes the screen.
   */
  run(): void {
    this.screen.render()
  }

  /**
   * Clears the screen.
   */
  clear(): void {
    this.cursor.detach()
    this.box.content = ''
    this.screen.title = ''
    this.screen.render()
  }

  /**
   * Updates the contents of the screen.
   * @param title Screen's title.
   * @param md Markdown content.
   */
  update(title: string, md: string): void {
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

    this.bindListeners()
    this.screen.render()
  }

  /**
   * Sets the title of the screen.
   * @param title Screen's title.
   */
  setTitle(title: string): void {
    this.screen.title = title
  }
}
