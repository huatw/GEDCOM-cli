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
  marraigeBeforeDeath(indi, fami)
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
 * @param {indi Map} indi 
 * @param {fami Map} fami 
 */
const datesBeforeCurrentDate = (indi, fami) => {
  indi.forEach(({id, name, birth, death}) => {
    if (birth > Date.now()) {
      errors.push(`birthday(${formatDate(birth)}) of ${name}(${id}) should not be after current date.`)
    }
    if (death > Date.now()) {
      errors.push(`death(${formatDate(death)}) of ${name}(${id}) should not be after current date.`)
    }
  })
  
  fami.forEach(({id, marrige, divorce}) => {
    if (marrige > Date.now()) {
      errors.push(`marrige date(${formatDate(marrige)}) of family(${id}) should not be after current date.`)
    }
    if (divorce > Date.now()) {
      errors.push(`divorce date(${formatDate(divorce)}) of family(${id}) should not be after current date.`)
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
  Array.from(fami.values()).forEach(({id, marrige, hid, wid}) => {
    if (marrige) {
      const hbirth = indi.get(hid).birth
      const wbirth = indi.get(wid).birth

      if (hbirth > marrige) {
        errors.push(`marraige date(${formatDate(marrige)}) of family(${id}) should not be after birthday(${formatDate(hbirth)}) of husband.`)
      }
      if (wbirth > marrige) {
        errors.push(`marraige date(${formatDate(marrige)}) of family(${id}) should not be after birthday(${formatDate(wbirth)}) of wife.`)
      }
    }
  })
}

/**
 * US05: Errors
 * Marraige should occur before death of either spouse
 * @param {indi Map} indi
 * @param {fami Map} fami
 */
const marraigeBeforeDeath = (indi, fami) => {
  Array.from(fami.values()).forEach(({id, marrige, hid, wid}) => {
    if(marrige) {
      const hdeath = indi.get(hid).death
      const wdeath = indi.get(wid).death

      if(hdeath < marrige) {
        errors.push(`marraige date(${formatDate(marrige)}) of family(${id}) should not be after death(${formatDate(hdeath)}) of husband.`)
      }
      if(wdeath < marrige) {
        errors.push(`marraige date(${formatDate(marrige)}) of family(${id}) should not be after birthday(${formatDate(wdeath)}) of wife.`)
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
    if(divorce) {
      const hdeath = indi.get(hid).death
      const wdeath = indi.get(wid).death

      if(hdeath < divorce) {
        errors.push(`divorce date(${formatDate(divorce)}) of family(${id}) should not be after death(${formatDate(hdeath)}) of husband.`)
      }
      if(wdeath < divorce) {
        errors.push(`divorce date(${formatDate(divorce)}) of family(${id}) should not be after birthday(${formatDate(wdeath)}) of wife.`)
      } 
    }
  })
}


module.exports = validate
