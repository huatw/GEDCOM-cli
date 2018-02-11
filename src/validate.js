'use strict'

const {formatDate} = require('./util')

let errors = []
let anomalies = []

/**
 * validate individual and family with selected user stories.
 * @param {indi Map} indi
 * @param {fami Map} fami
 */
function validate(indi, fami) {
  // cleanup before validation
  errors = []
  anomalies = []

  const indiArray = Array.from(indi.values())
  const famiArray = Array.from(fami.values())

  // spint1
  datesBeforeCurrentDate(indiArray, famiArray)
  birthBeforeMarriage(indi, fami)
  birthBeforeDeath(indiArray)
  marriageBeforeDivorce(famiArray)
  marriageBeforeDeath(indi, fami)
  divorceBeforeDeath(indi, fami)
  
  // spint2
  // TODO

  // spint3
  // TODO

  // spint4
  // TODO

  return {
    errors,
    anomalies
  }
}

/**
 * US01: Errors
 * check valid dates
 * Dates (birth, marriage, divorce, death) should not be after the current date
 * @param {indi[]} indi 
 * @param {fami[]} fami 
 */
const datesBeforeCurrentDate = (indi, fami) => {
  indi.forEach(({id, name, birth, death}) => {
    if (birth > Date.now()) {
      errors.push(`US01: birthday(${formatDate(birth)}) of ${name}(${id}) should not be after current date.`)
    }
    if (death && death > Date.now()) {
      errors.push(`US01: death(${formatDate(death)}) of ${name}(${id}) should not be after current date.`)
    }
  })
  
  fami.forEach(({id, marriage, divorce}) => {
    if (marriage > Date.now()) {
      errors.push(`US01: marriage date(${formatDate(marriage)}) of family(${id}) should not be after current date.`)
    }
    if (divorce && divorce > Date.now()) {
      errors.push(`US01: divorce date(${formatDate(divorce)}) of family(${id}) should not be after current date.`)
    }
  })
}

/**
 * US02: Errors
 * Birth should occur before marriage of an individual
 * @param {indi Map} indi
 * @param {fami Map} fami
 */
const birthBeforeMarriage = (indi, fami) => {
  Array.from(fami.values()).forEach(({id, marriage, hid, wid}) => {
    if (marriage) {
      const hbirth = indi.get(hid).birth
      const wbirth = indi.get(wid).birth

      if (hbirth > marriage) {
        errors.push(`US02: marriage date(${formatDate(marriage)}) of family(${id}) should not be after birthday(${formatDate(hbirth)}) of husband.`)
      }
      if (wbirth > marriage) {
        errors.push(`US02: marriage date(${formatDate(marriage)}) of family(${id}) should not be after birthday(${formatDate(wbirth)}) of wife.`)
      }
    }
  })
}

/**
 * US03: Errors
 * Birth should occur before death of an individual
 * @param {indi[]} indi
 */
const birthBeforeDeath = (indi) => {
  indi.forEach(({id, name, birth, death}) => {
    if (death && birth > death) {
      errors.push(`US03: death(${formatDate(death)}) of ${name}(${id}) should not be after birthday(${formatDate(birth)}).`)
    }
  })
}

/**
 * US04: Errors
 * Marriage should occur before divorce of spouses, and divorce can only occur after marriage
 * @param {fami[]} fami
 */
const marriageBeforeDivorce = (fami) => {
  fami.forEach(({id, marriage, divorce}) => {
    if (divorce && marriage > divorce) {
      errors.push(`US04: marriage date(${formatDate(marriage)}) of family(${id}) should not be after divorce(${formatDate(divorce)}).`)
    }
  })
}
  
/**
 * US05: Errors
 * Marraige should occur before death of either spouse
 * @param {indi Map} indi
 * @param {fami Map} fami
 */
const marriageBeforeDeath = (indi, fami) => {
  Array.from(fami.values()).forEach(({id, marriage, hid, wid}) => {
    if (marriage) {
      const hdeath = indi.get(hid).death
      const wdeath = indi.get(wid).death

      if (hdeath && hdeath < marriage) {
        errors.push(`US05: marriage date(${formatDate(marriage)}) of family(${id}) should not be after death(${formatDate(hdeath)}) of husband.`)
      }
      if (wdeath && wdeath < marriage) {
        errors.push(`US05: marriage date(${formatDate(marriage)}) of family(${id}) should not be after death(${formatDate(wdeath)}) of wife.`)
      } 
    }
  })
}

/**
 * US06: Errors
 * Divorce can only occur before death of both spouses
 * @param {indi Map} indi
 * @param {fami Map} fami
 */
const divorceBeforeDeath = (indi, fami) => {
  Array.from(fami.values()).forEach(({id, divorce, hid, wid}) => {
    if (divorce) {
      const hdeath = indi.get(hid).death
      const wdeath = indi.get(wid).death

      if (hdeath && hdeath < divorce) {
        errors.push(`US06: divorce date(${formatDate(divorce)}) of family(${id}) should not be after death(${formatDate(hdeath)}) of husband.`)
      }
      if (wdeath && wdeath < divorce) {
        errors.push(`US06: divorce date(${formatDate(divorce)}) of family(${id}) should not be after death(${formatDate(wdeath)}) of wife.`)
      } 
    }
  })
}

module.exports = validate
