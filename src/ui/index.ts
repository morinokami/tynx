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
  private top: number
  private left: number
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
    this.top = 0
    this.left = 0
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.top,
        left: this.left,
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
      this.top = this.nextCursorPosition(
        this.top,
        ch === 'j',
        this.box.height as number,
      )
    } else if (ch === 'h' || ch === 'l') {
      this.left = this.nextCursorPosition(
        this.left,
        ch === 'l',
        this.box.width as number,
      )
    }
  }

  private nextCursorPosition(
    current: number,
    forward: boolean,
    maxLength: number,
  ): number {
    let res = current + (forward ? 1 : -1)
    res = res < 0 ? 0 : res
    res = res > maxLength - 3 ? maxLength - 3 : res
    return res
  }

  private renderCursor() {
    this.cursor = blessed.box(
      Object.assign({}, cursorOptions, {
        parent: this.box,
        top: this.top,
        left: this.left,
      }),
    )
  }

  run(): void {
    this.screen.render()
  }
}

export default Screen
