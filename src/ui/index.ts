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
  private cursorATop: number // absolute position
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
    this.cursorATop = 0
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
      const cursor = this.nextCursorPosition(
        this.cursorTop,
        ch === 'j',
        this.box.height as number,
        this.box.getScrollHeight() as number,
      )
      this.cursorTop = cursor.position
      this.cursorATop = cursor.absolutePosition
      this.box.scrollTo(cursor.absolutePosition)
    } else if (ch === 'h' || ch === 'l') {
      const cursor = this.nextCursorPosition(
        this.cursorLeft,
        ch === 'l',
        this.box.width as number,
      )
      this.cursorLeft = cursor.position
    }
  }

  private nextCursorPosition(
    current: number,
    forward: boolean,
    boxLength: number,
    absoluteLength?: number,
  ): { position: number; absolutePosition: number } {
    let position = current + (forward ? 1 : -1)
    position = position < 0 ? 0 : position
    position = position > boxLength - 3 ? boxLength - 3 : position

    let absolutePosition = 0
    if (absoluteLength) {
      absolutePosition = this.cursorATop + (forward ? 1 : -1)
      absolutePosition = absolutePosition < 0 ? 0 : absolutePosition
      absolutePosition =
        absolutePosition > absoluteLength - 1
          ? absoluteLength - 1
          : absolutePosition
    }

    return { position, absolutePosition }
  }

  private renderCursor() {
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.cursorATop,
        left: this.cursorLeft,
      }),
    )
  }

  run(): void {
    this.screen.render()
  }
}

export default Screen
