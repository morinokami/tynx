import { hello } from './hello'

describe('hello', () => {
  test('say hello', () => {
    const res = hello('world')
    expect(res).toBe('Hello, world')
  })
})
