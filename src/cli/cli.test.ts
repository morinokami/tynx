import { CLI } from './cli'

jest.mock('meow', () =>
  jest.fn(() => ({
    input: ['https://example.com'],
    flags: { cache: true },
  })),
)

describe('CLI', () => {
  it('retains the url specified as a command line argument', () => {
    const cli = new CLI()
    expect(cli.url).toBe('https://example.com')
  })

  it('accepts cache flag', () => {
    const cli = new CLI()
    expect(cli.useCache).toBe(true)
  })
})
