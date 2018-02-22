'use strict'

const formatDate = d => d === undefined ? 'NA' : d.toLocaleDateString()

const getAge = (birth, death = new Date()) => {
  let age = death.getFullYear() - birth.getFullYear()
  const monthDiff = death.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
    age--
  }

  return age
}

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
