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
      if (ch === 'j' || ch === 'k') {
        this.top += ch === 'j' ? 1 : -1
        this.top = this.top < 0 ? 0 : this.top
        this.top =
          this.top > (this.box.height as number) - 3
            ? (this.box.height as number) - 3
            : this.top
      } else if (ch === 'h' || ch === 'l') {
        this.left += ch === 'l' ? 1 : -1
        this.left = this.left < 0 ? 0 : this.left
        this.left =
          this.left > (this.box.width as number) - 3
            ? (this.box.width as number) - 3
            : this.left
      }
      this.cursor = blessed.box(
        Object.assign({}, cursorOptions, {
          parent: this.box,
          top: this.top,
          left: this.left,
        }),
      )
      this.screen.render()
    })

    this.screen.key(['escape', 'q', 'C-c'], async () => {
      await this.exit()
    })
  }

  run(): void {
    this.screen.render()
  }
}

export default Screen
