'use strict'

const formatDate = d => d === undefined ? 'NA' : d.toLocaleDateString()

const getAge = (birth, death) => (death || new Date()).getFullYear() - birth.getFullYear()

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
  getAge,
  flatMap,
}
