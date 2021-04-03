import meow from 'meow'
import { CLI } from './cli'

jest.mock('meow')

const mockedMeow = meow as jest.Mock

describe('CLI', () => {
  it('has a url property', () => {
    mockedMeow.mockReturnValue({
      input: ['https://example.com'],
    })

    const cli = new CLI()
    expect(cli.url).toBe('https://example.com')
  })
})
