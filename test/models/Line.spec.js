'use strict'

const Line = require('../../src/models/Line')

describe('Line', function () {
  const level = 0
  const tag = 'tag'
  const arg = 'whatever'

  it('throws when missing level or tag', () => {
    expect(() => {
      new Line()
    }).toThrow('Line is invalid.')

    expect(() => {
      new Line(level)
    }).toThrow('Line is invalid.')
  })

  it('throws when level is not number', () => {
    expect(() => {
      new Line('1', tag)
    }).toThrow('Line is invalid.')
  })

  it('set props correctly', () => {
    const line = new Line(level, tag, arg)

    expect(line).toBeInstanceOf(Line)

    expect(line.level).toBe(level)
    expect(line.tag).toBe(tag)
    expect(line.arg).toBe(arg)
  })
})
