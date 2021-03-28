import blessed from 'blessed'

const boxOptions: blessed.Widgets.BoxOptions = {
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  tags: true,
  border: {
    type: 'line',
  },
  scrollable: true,
  mouse: true,
}

const cursorOptions: blessed.Widgets.BoxOptions = {
  width: 1,
  height: 1,
  style: {
    fg: 'white',
    bg: 'white',
  },
}

class Screen {
  private screen: blessed.Widgets.Screen
  private box: blessed.Widgets.BoxElement
  private cursorTop: number
  private cursorLeft: number
  private cursor: blessed.Widgets.BoxElement
  private follow: (url: string) => Promise<void>
  private goForward: () => Promise<void>
  private goBack: () => Promise<void>
  private exit: () => Promise<void>

  constructor(
    title: string,
    md: string,
    follow: (url: string) => Promise<void>,
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
    this.box = blessed.box(Object.assign({}, boxOptions, { content: md }))
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
    this.goForward = goForward
    this.goBack = goBack
    this.exit = exit

    this.bindListeners()
  }

  private bindListeners(): void {
    this.box.key(['h', 'j', 'k', 'l'], (ch: string) => {
      this.cursor.detach()
      this.updateCoordinate(ch)
      this.renderCursor()
      this.screen.render()
    })

    this.box.on('click', async (mouse) => {
      // move the cursor
      this.cursor.detach()
      const { x, y } = mouse
      this.cursorTop = this.box.childBase + y - 1
      this.cursorLeft = x - 1
      this.renderCursor()
      this.screen.render()

      // check if the clicked chunk is a markdown link
      const lines = this.box.getScreenLines()
      const before = lines.slice(0, this.cursorTop)
      const clickedIndex = before.join('').length + this.cursorLeft
      const clickedLine = lines[this.cursorTop]
      if (this.cursorLeft <= clickedLine.length) {
        const text = lines.join('')
        const regex = /\[([^[]+)\]\(([^)]+)\)/gm
        let match = regex.exec(text)
        while (match) {
          const start = match.index
          const end = start + match[0].length
          if (start <= clickedIndex && clickedIndex < end) {
            // move to the link destination
            this.cursor.detach()
            this.box.content = ''
            this.screen.title = ''
            this.screen.render()
            await this.follow(match[2])
            break
          }
          match = regex.exec(text)
        }
      }
    })

    this.screen.key(['escape', 'q', 'C-c', '[', ']'], async (ch: string) => {
      switch (ch) {
        case '[':
          await this.goBack()
          break
        case ']':
          await this.goForward()
          break
        default:
          await this.exit()
          break
      }
    })
  }

  private updateCoordinate(ch: string): void {
    if (ch === 'j' || ch === 'k') {
      this.cursorTop = this.nextCursorPosition(
        this.cursorTop,
        ch === 'j',
        this.box.getScrollHeight() as number,
        1,
      )
      this.box.scrollTo(this.cursorTop)
    } else if (ch === 'h' || ch === 'l') {
      this.cursorLeft = this.nextCursorPosition(
        this.cursorLeft,
        ch === 'l',
        this.box.width as number,
        3,
      )
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

  run(): void {
    this.screen.render()
  }

  update(title: string, md: string): void {
    this.screen.title = title
    this.box = blessed.box(Object.assign({}, boxOptions, { content: md }))
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
}

export default Screen
