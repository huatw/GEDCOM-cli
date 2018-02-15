'use strict'

const {
  formatDate,
  flatMap
} = require('../src/util')

describe('formatDate', function () {
  const NA = 'NA'
  const date = new Date()

  it('returns NA', () => {
    expect(formatDate()).toBe(NA)
  })

  it('returns toLocaleDateString string', () => {
    expect(formatDate(date)).toBe(date.toLocaleDateString())
  })
})

describe('flatMap', function () {
  it('returns empty array', () => {
    const arr = []
    const id = x => x
    expect(flatMap(arr, id)).toEqual([])
  })

  it('returns flatten array', () => {
    const arr = [[1], [2], [3], [4]]
    const id = x => x
    expect(flatMap(arr, id)).toEqual([1, 2, 3, 4])
  })
})
