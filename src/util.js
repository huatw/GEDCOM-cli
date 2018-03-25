'use strict'

const formatDate = d => d === undefined ? 'NA' : d.toLocaleDateString()

/**
 * getAge by one's birthday
 * count to death if death exists
 * elsewise count to today
 * @param {Date} birth
 * @param {Date} death
 * @return {Number}
 */
const getAge = (birth, death = new Date()) => {
  let age = death.getFullYear() - birth.getFullYear()
  const monthDiff = death.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * get difference in day
 * @param {Date} date1
 * @param {Date} date2
 * @return {Number}
 */
const diffDay = (date1, date2 = new Date()) => {
  const ONE_DAY = 1000 * 60 * 60 * 24

  const date1Ms = date1.getTime()
  const date2Ms = date2.getTime()
  const differenceMs = Math.abs(date1Ms - date2Ms)

  return Math.floor(differenceMs / ONE_DAY)
}

/**
 * get difference in month
 * @param {Date} date1
 * @param {Date} date2
 * @return {Number}
 */
const diffMonth = (date1, date2 = new Date()) => {
  if (date2 < date1) {
    const temp = date2
    date2 = date1
    date1 = temp
  }

  let months = (date2.getFullYear() - date1.getFullYear()) * 12

  months += date2.getMonth() - date1.getMonth()

  if (date2.getDate() < date1.getDate()) {
    months -= 1
  }

  return months
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
  diffDay,
  diffMonth,
  getAge,
  flatMap
}
