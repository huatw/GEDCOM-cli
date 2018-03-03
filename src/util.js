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
 * @param  {Iterable}   iterable
 * @param  {Function} fn
 * @return {Array}
 */
const flatMap = (iterable, fn) => {
  const result = []

  for (const [k, v] of iterable.entries()) {
    const ret = fn(v, k, iterable)

    if (Array.isArray(ret)) {
      result.push(...ret)
    } else {
      result.push(ret)
    }
  }

  return result
}

module.exports = {
  formatDate,
  getAge,
  flatMap
}
