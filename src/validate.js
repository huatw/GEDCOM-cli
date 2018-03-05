'use strict'

const {
  formatDate,
  getAge,
  flatMap
} = require('./util')

/**
 * validate individual and family with selected user stories.
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {object}
 */
function validate (indi, fami) {
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
const datesBeforeCurrentDate = (indi, fami) => ([
  ...flatMap(indi, ({id, name, birth, death}) => {
    const errors = []

    if (birth > Date.now()) {
      errors.push(`US01: birthday(${formatDate(birth)}) of ${name}(${id}) should not be after current date.`)
    }
    if (death && death > Date.now()) {
      errors.push(`US01: death(${formatDate(death)}) of ${name}(${id}) should not be after current date.`)
    }

    return errors
  }),

  ...flatMap(fami, ({id, marriage, divorce}) => {
    const errors = []

    if (marriage > Date.now()) {
      errors.push(`US01: marriage date(${formatDate(marriage)}) of family(${id}) should not be after current date.`)
    }
    if (divorce && divorce > Date.now()) {
      errors.push(`US01: divorce date(${formatDate(divorce)}) of family(${id}) should not be after current date.`)
    }

    return errors
  })
])

/**
 * US02: Errors
 * Birth should occur before marriage of an individual
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const birthBeforeMarriage = (indi, fami) =>
  flatMap(fami, ({id, marriage, hid, wid}) => {
    const errors = []

    if (marriage) {
      const hBirth = indi.get(hid).birth
      const wBirth = indi.get(wid).birth

      if (hBirth > marriage) {
        errors.push(`US02: marriage date(${formatDate(marriage)}) of family(${id}) should not be after birthday(${formatDate(hBirth)}) of husband.`)
      }
      if (wBirth > marriage) {
        errors.push(`US02: marriage date(${formatDate(marriage)}) of family(${id}) should not be after birthday(${formatDate(wBirth)}) of wife.`)
      }
    }

    return errors
  })

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
      const hDeath = indi.get(hid).death
      const wDeath = indi.get(wid).death

      if (hDeath && hDeath < marriage) {
        errors.push(`US05: marriage date(${formatDate(marriage)}) of family(${id}) should not be after death(${formatDate(hDeath)}) of husband.`)
      }
      if (wDeath && wDeath < marriage) {
        errors.push(`US05: marriage date(${formatDate(marriage)}) of family(${id}) should not be after death(${formatDate(wDeath)}) of wife.`)
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
      const hDeath = indi.get(hid).death
      const wDeath = indi.get(wid).death

      if (hDeath && hDeath < divorce) {
        errors.push(`US06: divorce date(${formatDate(divorce)}) of family(${id}) should not be after death(${formatDate(hDeath)}) of husband.`)
      }
      if (wDeath && wDeath < divorce) {
        errors.push(`US06: divorce date(${formatDate(divorce)}) of family(${id}) should not be after death(${formatDate(wDeath)}) of wife.`)
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
const lessThen150YearsOld = (indi) =>
  flatMap(indi, ({id, name, birth, death}) => {
    const age = getAge(birth, death)

    return age > 0 && age > 150
      ? [`US07: age ${age} of ${name}(${id}) should not be more than 150.`]
      : []
  })

/**
 * US08: Anomalies
 * Children should be born after marriage of parents
 * (and not more than 9 months after their divorce)
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 : */
const birthBeforeMarriageOfParents = (indi, fami) =>
  flatMap(fami, ({id, marriage, divorce, cids}) =>
    flatMap(cids, (cid) => {
      const anomalies = []

      const cBirth = indi.get(cid).birth
      const cName = indi.get(cid).name

      if (marriage > cBirth) {
        anomalies.push(`US08: birth ${formatDate(cBirth)} of child ${cName}(${cid}) should be after marriage(${formatDate(marriage)}) in family(${id}).`)
      }

      if (divorce) {
        const lastDate = new Date(divorce.getTime())
        lastDate.setMonth(lastDate.getMonth() + 8)

        if (lastDate < cBirth) {
          anomalies.push(`US08: birth ${formatDate(cBirth)} of child ${cName}(${cid}) should be before 9 months after divorce(${formatDate(divorce)}) in family(${id}).`)
        }
      }

      return anomalies
    })
  )

/**
 * US09: Errors
 * Child should be born before death of mother and before 9 months after death of father
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const birthBeforeDeathOfParents = (indi, fami) => {
  const errors = []

  fami.forEach(({id, hid, wid, cids}) => {
    const wDeath = indi.get(wid).death
    const hDeath = indi.get(hid).death

    cids.forEach((cid) => {
      const cBirth = indi.get(cid).birth
      const cName = indi.get(cid).name

      if (wDeath && cBirth > wDeath) {
        errors.push(`US09: birthday(${formatDate(cBirth)}) of child ${cName}(${cid}) should be before death(${formatDate(wDeath)}) of wife(${wid}).`)
      }

      if (hDeath) {
        const lastDate = new Date(hDeath.getTime())
        lastDate.setMonth(lastDate.getMonth() + 9)

        if (lastDate < cBirth) {
          errors.push(`US09: birthday(${formatDate(cBirth)}) of child ${cName}(${cid}) should be within 9 months after death(${formatDate(hDeath)}) of husband(${hid}).`)
        }
      }
    })
  })

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

  fami.forEach(({id, marriage, hid, wid}) => {
    const hBirth = indi.get(hid).birth
    const hAge = getAge(hBirth, marriage)
    if (hAge < 14) {
      anomalies.push(`US10: marriage ${formatDate(marriage)} of family(${id}) should be 14 years after birth(${formatDate(hBirth)}) of husband(${hid}).`)
    }

    const wBirth = indi.get(wid).birth
    const wAge = getAge(wBirth, marriage)
    if (wAge < 14) {
      anomalies.push(`US10: marriage ${formatDate(marriage)} of family(${id}) should be 14 years after birth(${formatDate(wBirth)}) of husband(${wid}).`)
    }
  })

  return anomalies
}

/**
 * US11: Anomalies
 * Marriage should not occur during marriage to another spouse
 * @param {indi Map} indi
 * @param {fami Map} fami
 * @return {Array}
 */
const noBigamy = (fami) => {
  const anomalies = []
  const famMap = {}

  fami.forEach(({id, marriage, divorce, wid, hid}) => {
    if (!divorce) {
      divorce = new Date()
    }

    if (!famMap[wid]) {
      famMap[wid] = []
    }

    famMap[wid].forEach(({id: fid, marriage: marri, divorce: divor}) => {
      if (marri.getTime() === marriage.getTime()) {
        anomalies.push(`US11: wife(${wid}) marriage(${id}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marri)}`)
      } else if ((marri < marriage && marriage <= divor) || (marri >= marriage && marriage <= divorce)) {
        anomalies.push(`US11: wife(${wid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
      }
    })

    famMap[wid].push({id, marriage, divorce})

    if (!famMap[hid]) {
      famMap[hid] = []
    }

    famMap[hid].forEach(({id: fid, marriage: marri, divorce: divor}) => {
      if (marri.getTime() === marriage.getTime()) {
        anomalies.push(`US11: husband(${hid}) marriage(${id}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marri)}`)
      } else if ((marri < marriage && marriage <= divor) || (marri >= marriage && marriage <= divor)) {
        anomalies.push(`US11: husband(${hid}) marriage(${id}) on ${formatDate(marriage)} cannot occur during marriage(${fid}) on ${formatDate(marri)}`)
      }
    })

    famMap[hid].push({id, marriage, divorce})
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

  fami.forEach(({id, hid, wid, cids}) => {
    const husb = indi.get(hid)
    const wife = indi.get(wid)

    cids.forEach((cid) => {
      const child = indi.get(cid)
      const husbAge = getAge(husb.birth, husb.death)
      const wifeAge = getAge(wife.birth, wife.death)
      const childAge = getAge(child.birth, child.death)

      if (husbAge - childAge >= 80) {
        anomalies.push(`US12: husband(${hid}) age ${husbAge} of marriage: marriage(${id}) cannot be 80 (total: ${husbAge - childAge}) years older than child ${cid} of age ${childAge}`)
      }

      if (wifeAge - childAge >= 60) {
        anomalies.push(`US12: wife(${wid}) age ${wifeAge} of marriage: marriage(${id}) cannot be 60 (total: ${wifeAge - childAge}) years older than child ${cid} of age ${childAge}`)
      }
    })
  })

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
  birthBeforeDeathOfParents
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
  uniqueFirstNamesInFamilies
]

module.exports = validate
