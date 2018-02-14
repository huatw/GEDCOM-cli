'use strict'

const formatDate = d => d === undefined ? 'NA' : d.toLocaleDateString()

/**
 * naive implementation of flatMap
 * @param  {Array}   arr
 * @param  {Function} fn
 * @return {Array}
 */
const flatMap = (arr, fn) =>
  arr.reduce((acc, v, k) => [...acc, ...fn(v, k, arr)], [])

module.exports = {
  formatDate,
  flatMap
}
