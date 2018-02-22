'use strict'

const {
  formatDate,
  flatMap
} = require('./util')

/**
 * validate individual and family with selected user stories.
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {object}
 */
function validate(indi, fami) {
  const anomalies = flatMap(validateAnomalFns, (fn) => fn(indi, fami))
  const errors = flatMap(validateErrorFns, (fn) => fn(indi, fami))

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
 * @return {Array}
 */
const datesBeforeCurrentDate = (indi, fami) => {
  const errors = []

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

  return errors
}

/**
 * US02: Errors
 * Birth should occur before marriage of an individual
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const birthBeforeMarriage = (indi, fami) => {
  const errors = []

  fami.forEach(({id, marriage, hid, wid}) => {
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

  return errors
}

/**
 * US03: Errors
 * Birth should occur before death of an individual
 * @param {indi Map} indi
 * @return {Array}
 */
const birthBeforeDeath = (indi) => {
  const errors = []

  indi.forEach(({id, name, birth, death}) => {
    if (death && birth > death) {
      errors.push(`US03: death(${formatDate(death)}) of ${name}(${id}) should not be after birthday(${formatDate(birth)}).`)
    }
  })

  return errors
}

/**
 * US04: Errors
 * Marriage should occur before divorce of spouses, and divorce can only occur after marriage
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const marriageBeforeDivorce = (indi, fami) => {
  const errors = []

  fami.forEach(({id, marriage, divorce}) => {
    if (divorce && marriage > divorce) {
      errors.push(`US04: marriage date(${formatDate(marriage)}) of family(${id}) should not be after divorce(${formatDate(divorce)}).`)
    }
  })

  return errors
}

/**
 * US05: Errors
 * Marraige should occur before death of either spouse
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const marriageBeforeDeath = (indi, fami) => {
  const errors = []

  fami.forEach(({id, marriage, hid, wid}) => {
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

  return errors
}

/**
 * US06: Errors
 * Divorce can only occur before death of both spouses
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const divorceBeforeDeath = (indi, fami) => {
  const errors = []

  fami.forEach(({id, divorce, hid, wid}) => {
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

  return errors
}


/**
 * US07: Errors
 * Age < 150
 * Death should be less than 150 years after birth for dead people,
 * and current date should be less than 150 years after birth for all living people
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const lessThen150YearsOld = (indi) => {
  const errors = []

  indi.forEach(({id, name, birth, death}) => {
    const age = (death || new Date()).getFullYear() - birth.getFullYear()

    if (age > 0 && age > 150) {
      errors.push(`US07: age ${age} of ${name}(${id}) should not be more than 150.`)
    }
  })

  return errors
}

/**
 * US08: Anomalies
 * Children should be born after marriage of parents
 * (and not more than 9 months after their divorce)
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 : */
const birthBeforeMarriageOfParents = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US09: Errors
 * Child should be born before death of mother and before 9 months after death of father
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const birthBeforeDeathOfParents = (indi, fami) => {
  const errors = []
  // TODO
  return errors
}

/**
 * US10: Anomalies
 * Marriage should be at least 14 years after birth of both spouses
 * (parents must be at least 14 years old)
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const marriageAfter14 = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US11: Anomalies
 * Marriage should not occur during marriage to another spouse
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const noBigamy = (indi, fami) => {
  const anomalies = []
  
    let fammap = {}

    fami.forEach(({id, marriage, divorce, wid, hid}) => {
        if(!divorce) {
            divorce = Date.now()
        }

        if(!fammap[wid]) {
            fammap[wid] = [{
                id,
                marriage,
                divorce
            }]
        } else {
            fammap[wid].forEach(({id: fid, marriage: marri, divorce: divor}) => { 
                if(marri == marriage) {
                    anomalies.push(`US11: wife(${wid}) marriage(${id}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marri)}`)
                } 
                else if(marri < marriage) {
                    if(marriage <= divor) {
                        anomalies.push(`US11: wife(${wid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
                    }
                } else {
                    if(marri <= divorce) {
                        anomalies.push(`US11: wife(${wid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
                    }
                }
            })
            fammap[wid].push({
                id,
                marriage,
                divorce
            })
        }

        if(!fammap[hid]) {
            fammap[hid] = [{
                id,
                marriage,
                divorce
            }]
        } else {
            fammap[hid].forEach(({id: fid, marriage: marri, divorce: divor}) => { 
                if(marri == marriage) {
                    anomalies.push(`US11: husband(${hid}) marriage(${id}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marri)}`)
                } 
                else if(marri < marriage) {
                    if(marriage <= divor) {
                        anomalies.push(`US11: husband(${hid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
                    }
                } else {
                    if(marri <= divorce) {
                        anomalies.push(`US11: husband(${hid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
                    }
                }
            })
            fammap[hid].push({
                id,
                marriage,
                divorce
            })
        }
    })

  return anomalies
}

/**
 * US12: Anomalies
 * Mother should be less than 60 years older than her children
 * and father should be less than 80 years older than his children
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const parentsNotTooOld = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US13: Anomalies
 * Birth dates of siblings should be more than 8 months apart or less than 2 days apart
 * (twins may be born one day apart, e.g. 11:59 PM and 12:02 AM the following calendar day)
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const siblingsSpacing = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US14: Anomalies
 * No more than five siblings should be born at the same time
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const multipleBirthsNoLargerThan5 = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US15: Anomalies
 * There should be fewer than 15 siblings in a family
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const fewerThan15Siblings = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US16: Anomalies
 * All male members of a family should have the same last name
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const maleLastNames = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US17: Anomalies
 * Parents should not marry any of their descendants
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const noMarriagesToDescendants = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US18: Anomalies
 * Siblings should not marry one another
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const siblingsShouldNotMarry = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US19: Anomalies
 * First cousins should not marry one another
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const firstCousinsShouldNotMarry = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US20: Anomalies
 * Aunts and uncles should not marry their nieces or nephews
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const auntsAndUncles = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US21: Anomalies
 * Husband in family should be male and wife in family should be female
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const correctGenderForRole = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

// US22 have been done in parser, do US25 instead. Do not bother that.

/**
 * US23: Anomalies
 * No more than one individual with the same name and birth date should appear in a GEDCOM file
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const uniqueNameAndBirthDate = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US24: Anomalies
 * No more than one family with the same spouses by name
 * and the same marriage date should appear in a GEDCOM file
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const uniqueFamiliesBySpouses = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

/**
 * US25: Anomalies
 * No more than one child with the same name and birth date should appear in a family
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const uniqueFirstNamesInFamilies = (indi, fami) => {
  const anomalies = []
  // TODO
  return anomalies
}

const validateErrorFns = [
  datesBeforeCurrentDate,
  birthBeforeMarriage,
  birthBeforeDeath,
  marriageBeforeDivorce,
  marriageBeforeDeath,
  divorceBeforeDeath,
  lessThen150YearsOld,
  birthBeforeDeathOfParents,
]

const validateAnomalFns = [
  birthBeforeMarriageOfParents,
  marriageAfter14,
  noBigamy,
  parentsNotTooOld,
  siblingsSpacing,
  multipleBirthsNoLargerThan5,
  fewerThan15Siblings,
  maleLastNames,
  noMarriagesToDescendants,
  siblingsShouldNotMarry,
  firstCousinsShouldNotMarry,
  auntsAndUncles,
  correctGenderForRole,
  uniqueNameAndBirthDate,
  uniqueFamiliesBySpouses,
  uniqueFirstNamesInFamilies,
]

module.exports = validate
