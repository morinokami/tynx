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
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0',
    },
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
  private text: string
  private screen: blessed.Widgets.Screen
  private box: blessed.Widgets.BoxElement
  private cursorTop: number
  private cursorLeft: number
  private cursor: blessed.Widgets.BoxElement
  private exit: () => Promise<void>

  constructor(md: string, title: string, exit: () => Promise<void>) {
    this.text = md
    this.screen = blessed.screen({
      smartCSR: true,
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

    this.screen.key(['escape', 'q', 'C-c'], async () => {
      await this.exit()
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

  private renderCursor() {
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
}

export default Screen
