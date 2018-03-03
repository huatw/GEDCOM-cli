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
    const m = new Map()
    const s = new Set()

    const id = x => x

    expect(flatMap(arr, id)).toEqual([])
    expect(flatMap(m, id)).toEqual([])
    expect(flatMap(s, id)).toEqual([])
  })

  it('ignore and filter empty return', () => {
    const arr = [4, 5, 6]
    const m = new Map([[4, 5], [6, 7]])
    const s = new Set([4, 5, 6])

    const getEmpty = x => []
    const filterFive = x => x === 5 ? [] : [x]

    expect(flatMap(arr, getEmpty)).toEqual([])
    expect(flatMap(m, getEmpty)).toEqual([])
    expect(flatMap(s, getEmpty)).toEqual([])

    expect(flatMap(arr, filterFive)).toEqual([4, 6])
    expect(flatMap(m, filterFive)).toEqual([7])
    expect(flatMap(s, filterFive)).toEqual([4, 6])
  })

  it('returns flatten array', () => {
    const arr = [1, 2, 3, 4]
    const m = new Map([[4, 5], [6, 7]])
    const s = new Set([4, 5, 6])

    const fn = x => ([x + 1])
    const fn2 = (_, idx) => ([idx + 1])

    expect(flatMap(arr, fn)).toEqual([2, 3, 4, 5])
    expect(flatMap(m, fn)).toEqual([6, 8])
    expect(flatMap(s, fn)).toEqual([5, 6, 7])

    expect(flatMap(arr, fn2)).toEqual([1, 2, 3, 4])
    expect(flatMap(m, fn2)).toEqual([5, 7])
    expect(flatMap(s, fn2)).toEqual([5, 6, 7])
  })
})
