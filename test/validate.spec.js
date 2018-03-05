'use strict'

const rewire = require('rewire')

const {
  formatDate,
  getAge
} = require('../src/util')
const Indi = require('../src/models/Indi')
const Fami = require('../src/models/Fami')

const validate = require('../src/validate')
const _validate = rewire('../src/validate')

const wrongDate = new Date(2222, 1, 1)
const earlyDate = new Date(1700, 1, 1)

const id = 'fake id'
const name = 'fake name'
const sex = 'M'
const birth = new Date(1970, 1, 1)
const death = new Date(2015, 1, 1)
const famc = 'fake famc'
const fams = []
const cBirth = new Date(1992, 1, 1)

const fid = 'fake fid'
const fid2 = 'fake fid2'
const hid = 'fake hid'
const hid2 = 'fake hid2'
const wid = 'fake wid'
const wid2 = 'fake wid2'
const marriage = new Date(1990, 1, 1)
const divorce = new Date(1995, 1, 1)

describe('validate', function () {
  it('returns object with no error and anomaly', () => {
    const indi = new Map()
    const fami = new Map()

    expect(validate(indi, fami)).toEqual({
      errors: [],
      anomalies: []
    })
  })
  // TODO
})

describe('US01: datesBeforeCurrentDate', function () {
  const datesBeforeCurrentDate = _validate.__get__('datesBeforeCurrentDate')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(datesBeforeCurrentDate(indi, fami)).toEqual([])
  })

  it('returns array with only one birthday error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, wrongDate, death, famc, fams)]
    ])
    const fami = new Map()

    expect(datesBeforeCurrentDate(indi, fami)).toEqual([
      `US01: birthday(${formatDate(wrongDate)}) of ${name}(${id}) should not be after current date.`
    ])
  })

  it('returns array with only one death error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, birth, wrongDate, famc, fams)]
    ])
    const fami = new Map()

    expect(datesBeforeCurrentDate(indi, fami)).toEqual([
      `US01: death(${formatDate(wrongDate)}) of ${name}(${id}) should not be after current date.`
    ])
  })

  it('returns array with only one marriage date error', () => {
    const indi = new Map()
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], wrongDate)]
    ])

    expect(datesBeforeCurrentDate(indi, fami)).toEqual([
      `US01: marriage date(${formatDate(wrongDate)}) of family(${fid}) should not be after current date.`
    ])
  })

  it('returns array with only one divorce date error', () => {
    const indi = new Map()
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage, wrongDate)]
    ])

    expect(datesBeforeCurrentDate(indi, fami)).toEqual([
      `US01: divorce date(${formatDate(wrongDate)}) of family(${fid}) should not be after current date.`
    ])
  })
})

describe('US02: birthBeforeMarriage', function () {
  const birthBeforeMarriage = _validate.__get__('birthBeforeMarriage')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(birthBeforeMarriage(indi, fami)).toEqual([])
  })

  it('returns array with only one huaband birthday after marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, wrongDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(birthBeforeMarriage(indi, fami)).toEqual([
      `US02: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after birthday(${formatDate(wrongDate)}) of husband.`
    ])
  })

  it('returns array with only one wife birthday after marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, wrongDate, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(birthBeforeMarriage(indi, fami)).toEqual([
      `US02: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after birthday(${formatDate(wrongDate)}) of wife.`
    ])
  })
})

describe('US03: birthBeforeDeath', function () {
  const birthBeforeDeath = _validate.__get__('birthBeforeDeath')

  it('returns empty error array', () => {
    const indi = new Map()

    expect(birthBeforeDeath(indi)).toEqual([])
  })

  it('returns empty error array when death is not exist', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, birth, undefined, famc, fams)]
    ])

    expect(birthBeforeDeath(indi)).toEqual([])
  })

  it('returns array with only one birth before death error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, wrongDate, death, famc, fams)]
    ])

    expect(birthBeforeDeath(indi)).toEqual([
      `US03: death(${formatDate(death)}) of ${name}(${id}) should not be after birthday(${formatDate(wrongDate)}).`
    ])
  })
})

describe('US04: marriageBeforeDivorce', function () {
  const marriageBeforeDivorce = _validate.__get__('marriageBeforeDivorce')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(marriageBeforeDivorce(indi, fami)).toEqual([])
  })

  it('returns empty error array when divorce is not exist', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageBeforeDivorce(undefined, fami)).toEqual([])
  })

  it('returns array with only one marriage after divorce error', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], wrongDate, divorce)]
    ])

    expect(marriageBeforeDivorce(undefined, fami)).toEqual([
      `US04: marriage date(${formatDate(wrongDate)}) of family(${fid}) should not be after divorce(${formatDate(divorce)}).`
    ])
  })
})

describe('US05: marriageBeforeDeath', function () {
  const marriageBeforeDeath = _validate.__get__('marriageBeforeDeath')

  const hdeath = new Date(2015, 1, 1)
  const wdeath = new Date(2015, 1, 1)

  const marriage = new Date(2222, 1, 1)

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(marriageBeforeDeath(indi, fami)).toEqual([])
  })

  it('returns array with two errors with husband and wife death before marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, hdeath, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageBeforeDeath(indi, fami)).toEqual([
      `US05: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after death(${formatDate(hdeath)}) of husband.`,
      `US05: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after death(${formatDate(wdeath)}) of wife.`
    ])
  })

  it('returns array with only one wife marraige before death error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageBeforeDeath(indi, fami)).toEqual([
      `US05: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after death(${formatDate(wdeath)}) of wife.`
    ])
  })
})

describe('US06: divorceBeforeDeath', function () {
  const divorceBeforeDeath = _validate.__get__('divorceBeforeDeath')

  const hdeath = new Date(2015, 1, 1)
  const wdeath = new Date(2015, 1, 1)
  const marriage = new Date(2014, 1, 1)
  const divorce = new Date(2222, 1, 1)

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(divorceBeforeDeath(indi, fami)).toEqual([])
  })

  it('returns array with two errors with husband and wife death before divorce error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, hdeath, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage, divorce)]
    ])

    expect(divorceBeforeDeath(indi, fami)).toEqual([
      `US06: divorce date(${formatDate(divorce)}) of family(${fid}) should not be after death(${formatDate(hdeath)}) of husband.`,
      `US06: divorce date(${formatDate(divorce)}) of family(${fid}) should not be after death(${formatDate(wdeath)}) of wife.`
    ])
  })

  it('returns array with only one wife divorce before death error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage, divorce)]
    ])

    expect(divorceBeforeDeath(indi, fami)).toEqual([
      `US06: divorce date(${formatDate(divorce)}) of family(${fid}) should not be after death(${formatDate(wdeath)}) of wife.`
    ])
  })
})

describe('US07: lessThen150YearsOld', function () {
  const lessThen150YearsOld = _validate.__get__('lessThen150YearsOld')

  it('returns empty error array', () => {
    const indi = new Map()

    expect(lessThen150YearsOld(indi)).toEqual([])
  })

  it('returns array with only one age error', () => {
    const age = getAge(earlyDate)

    const indi = new Map([
      [id, new Indi(id, name, sex, earlyDate, undefined, famc, fams)]
    ])

    expect(lessThen150YearsOld(indi)).toEqual([
      `US07: age ${age} of ${name}(${id}) should not be more than 150.`
    ])
  })
})

describe('US08: birthBeforeMarriageOfParents', function () {
  const birthBeforeMarriageOfParents = _validate.__get__('birthBeforeMarriageOfParents')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(birthBeforeMarriageOfParents(indi, fami)).toEqual([])
  })

  it('returns array with only one error: child born before marriage', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, earlyDate, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage)]
    ])

    expect(birthBeforeMarriageOfParents(indi, fami)).toEqual([
      `US08: birth ${formatDate(earlyDate)} of child ${name}(${id}) should be after marriage(${formatDate(marriage)}) in family(${fid}).`
    ])
  })

  it('returns array with only one error: child born after divorce', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, earlyDate)]
    ])

    expect(birthBeforeMarriageOfParents(indi, fami)).toEqual([
      `US08: birth ${formatDate(cBirth)} of child ${name}(${id}) should be before 9 months after divorce(${formatDate(earlyDate)}) in family(${fid}).`
    ])
  })
})

// TODO
// describe('US09: birthBeforeDeathOfParents', function () {
//   const birthBeforeDeathOfParents = _validate.__get__('birthBeforeDeathOfParents')
// })
// describe('US10: marriageAfter14', function () {
//   const marriageAfter14 = _validate.__get__('marriageAfter14')
// })
describe('US11: noBigamy', function () {
  const noBigamy = _validate.__get__('noBigamy')

  it('returns empty anomolies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(noBigamy(fami)).toEqual([])
  })

  it('returns array with only one anomily: wife overlapping marraiges', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
      [fid2, new Fami(fid2, hid2, wid, undefined, marriage, undefined)]
    ])
    
    expect(noBigamy(fami)).toEqual([`US11: wife(${wid}) marriage(${fid2}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marriage)}`])
  })

  it('returns array with only one anomily: husband overlapping marraiges', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
      [fid2, new Fami(fid2, hid, wid2, undefined, earlyDate, undefined)]
    ])
    
    expect(noBigamy(fami)).toEqual([`US11: husband(${hid}) marriage(${fid2}) on ${formatDate(earlyDate)} cannot occur during marriage(${fid}) on ${formatDate(marriage)}`])
  })
  
})
describe('US12: parentsNotTooOld', function () {
  const parentsNotTooOld = _validate.__get__('parentsNotTooOld')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()
    
    expect(parentsNotTooOld(indi, fami)).toEqual([])
  })

  it('returns an empty anomalies array', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
    ])

    expect(parentsNotTooOld(indi, fami)).toEqual([])
  })

  it('returns an empty anomalies array', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, earlyDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
    ])

    const husbAge = getAge(earlyDate, undefined)
    const childAge = getAge(cBirth, undefined)

    expect(parentsNotTooOld(indi, fami)).toEqual([`US12: husband(${hid}) age ${husbAge} of marriage: marriage(${fid}) cannot be 80 (total: ${husbAge - childAge}) years older than child ${id} of age ${childAge}`])
  })

})
// describe('US13: siblingsSpacing', function () {
//   const siblingsSpacing = _validate.__get__('siblingsSpacing')
// })
// describe('US14: multipleBirthsNoLargerThan5', function () {
//   const multipleBirthsNoLargerThan5 = _validate.__get__('multipleBirthsNoLargerThan5')
// })
// describe('US15: fewerThan15Siblings', function () {
//   const fewerThan15Siblings = _validate.__get__('fewerThan15Siblings')
// })
// describe('US16: maleLastNames', function () {
//   const maleLastNames = _validate.__get__('maleLastNames')
// })
// describe('US17: noMarriagesToDescendants', function () {
//   const noMarriagesToDescendants = _validate.__get__('noMarriagesToDescendants')
// })
// describe('US18: siblingsShouldNotMarry', function () {
//   const siblingsShouldNotMarry = _validate.__get__('siblingsShouldNotMarry')
// })
// describe('US19: firstCousinsShouldNotMarry', function () {
//   const firstCousinsShouldNotMarry = _validate.__get__('firstCousinsShouldNotMarry')
// })
// describe('US20: auntsAndUncles', function () {
//   const auntsAndUncles = _validate.__get__('auntsAndUncles')
// })
// describe('US21: correctGenderForRole', function () {
//   const correctGenderForRole = _validate.__get__('correctGenderForRole')
// })
// describe('US23: uniqueNameAndBirthDate', function () {
//   const uniqueNameAndBirthDate = _validate.__get__('uniqueNameAndBirthDate')
// })
// describe('US24: uniqueFamiliesBySpouses', function () {
//   const uniqueFamiliesBySpouses = _validate.__get__('uniqueFamiliesBySpouses')
// })
// describe('US25: uniqueFirstNamesInFamilies', function () {
//   const uniqueFirstNamesInFamilies = _validate.__get__('uniqueFirstNamesInFamilies')
// })
