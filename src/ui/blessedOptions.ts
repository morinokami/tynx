import blessed from 'blessed'

export const boxOptions: blessed.Widgets.BoxOptions = {
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

export const cursorOptions: blessed.Widgets.BoxOptions = {
  width: 1,
  height: 1,
  style: {
    fg: 'white',
    bg: 'white',
  },
}

export const inputFieldOptions: blessed.Widgets.BoxOptions = {
  input: true,
  keys: true,
  top: 'center',
  left: 'center',
  width: '100%',
  height: 3,
  border: {
    type: 'line',
  },
}
