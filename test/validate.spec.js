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

const lateDate = new Date(2222, 1, 1)
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

    expect(datesBeforeCurrentDate({indi, fami})).toEqual([])
  })

  it('returns array with only one birthday error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, lateDate, death, famc, fams)]
    ])
    const fami = new Map()

    expect(datesBeforeCurrentDate({indi, fami})).toEqual([
      `US01: birthday(${formatDate(lateDate)}) of ${name}(${id}) should not be after current date.`
    ])
  })

  it('returns array with only one death error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, birth, lateDate, famc, fams)]
    ])
    const fami = new Map()

    expect(datesBeforeCurrentDate({indi, fami})).toEqual([
      `US01: death(${formatDate(lateDate)}) of ${name}(${id}) should not be after current date.`
    ])
  })

  it('returns array with only one marriage date error', () => {
    const indi = new Map()
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], lateDate)]
    ])

    expect(datesBeforeCurrentDate({indi, fami})).toEqual([
      `US01: marriage date(${formatDate(lateDate)}) of family(${fid}) should not be after current date.`
    ])
  })

  it('returns array with only one divorce date error', () => {
    const indi = new Map()
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage, lateDate)]
    ])

    expect(datesBeforeCurrentDate({indi, fami})).toEqual([
      `US01: divorce date(${formatDate(lateDate)}) of family(${fid}) should not be after current date.`
    ])
  })
})

describe('US02: birthBeforeMarriage', function () {
  const birthBeforeMarriage = _validate.__get__('birthBeforeMarriage')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(birthBeforeMarriage({indi, fami})).toEqual([])
  })

  it('returns array with only one huaband birthday after marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, lateDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(birthBeforeMarriage({indi, fami})).toEqual([
      `US02: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after birthday(${formatDate(lateDate)}) of husband.`
    ])
  })

  it('returns array with only one wife birthday after marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, lateDate, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(birthBeforeMarriage({indi, fami})).toEqual([
      `US02: marriage date(${formatDate(marriage)}) of family(${fid}) should not be after birthday(${formatDate(lateDate)}) of wife.`
    ])
  })
})

describe('US03: birthBeforeDeath', function () {
  const birthBeforeDeath = _validate.__get__('birthBeforeDeath')

  it('returns empty error array', () => {
    const indi = new Map()

    expect(birthBeforeDeath({indi})).toEqual([])
  })

  it('returns empty error array when death is not exist', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, birth, undefined, famc, fams)]
    ])

    expect(birthBeforeDeath({indi})).toEqual([])
  })

  it('returns array with only one birth before death error', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, lateDate, death, famc, fams)]
    ])

    expect(birthBeforeDeath({indi})).toEqual([
      `US03: death(${formatDate(death)}) of ${name}(${id}) should not be after birthday(${formatDate(lateDate)}).`
    ])
  })
})

describe('US04: marriageBeforeDivorce', function () {
  const marriageBeforeDivorce = _validate.__get__('marriageBeforeDivorce')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(marriageBeforeDivorce({indi, fami})).toEqual([])
  })

  it('returns empty error array when divorce is not exist', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageBeforeDivorce({fami})).toEqual([])
  })

  it('returns array with only one marriage after divorce error', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], lateDate, divorce)]
    ])

    expect(marriageBeforeDivorce({fami})).toEqual([
      `US04: marriage date(${formatDate(lateDate)}) of family(${fid}) should not be after divorce(${formatDate(divorce)}).`
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

    expect(marriageBeforeDeath({indi, fami})).toEqual([])
  })

  it('returns array with two errors with husband and wife death before marriage error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, hdeath, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageBeforeDeath({indi, fami})).toEqual([
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

    expect(marriageBeforeDeath({indi, fami})).toEqual([
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

    expect(divorceBeforeDeath({indi, fami})).toEqual([])
  })

  it('returns array with two errors with husband and wife death before divorce error', () => {
    const indi = new Map([
      [hid, new Indi(hid, name, sex, birth, hdeath, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, wdeath, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage, divorce)]
    ])

    expect(divorceBeforeDeath({indi, fami})).toEqual([
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

    expect(divorceBeforeDeath({indi, fami})).toEqual([
      `US06: divorce date(${formatDate(divorce)}) of family(${fid}) should not be after death(${formatDate(wdeath)}) of wife.`
    ])
  })
})

describe('US07: lessThen150YearsOld', function () {
  const lessThen150YearsOld = _validate.__get__('lessThen150YearsOld')

  it('returns empty error array', () => {
    const indi = new Map()

    expect(lessThen150YearsOld({indi})).toEqual([])
  })

  it('returns array with only one age error', () => {
    const age = getAge(earlyDate)

    const indi = new Map([
      [id, new Indi(id, name, sex, earlyDate, undefined, famc, fams)]
    ])

    expect(lessThen150YearsOld({indi})).toEqual([
      `US07: age ${age} of ${name}(${id}) should not be more than 150.`
    ])
  })
})

describe('US08: birthBeforeMarriageOfParents', function () {
  const birthBeforeMarriageOfParents = _validate.__get__('birthBeforeMarriageOfParents')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(birthBeforeMarriageOfParents({indi, fami})).toEqual([])
  })

  it('returns array with only one error: child born before marriage', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, earlyDate, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage)]
    ])

    expect(birthBeforeMarriageOfParents({indi, fami})).toEqual([
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

    expect(birthBeforeMarriageOfParents({indi, fami})).toEqual([
      `US08: birth ${formatDate(cBirth)} of child ${name}(${id}) should be before 9 months after divorce(${formatDate(earlyDate)}) in family(${fid}).`
    ])
  })
})

describe('US09: birthBeforeDeathOfParents', function () {
  const birthBeforeDeathOfParents = _validate.__get__('birthBeforeDeathOfParents')

  it('returns empty error array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(birthBeforeDeathOfParents({indi, fami})).toEqual([])
  })

  it('returns array with only one error: child born after death of mother', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, lateDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, death, famc, fams)],
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage)]
    ])

    expect(birthBeforeDeathOfParents({indi, fami})).toEqual([
      `US09: birthday(${formatDate(lateDate)}) of child ${name}(${id}) should be before death(${formatDate(death)}) of wife(${wid}).`
    ])
  })

  it('returns array with only one error: child born after 9 months after death of father', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, lateDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, birth, death, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage)]
    ])

    expect(birthBeforeDeathOfParents({indi, fami})).toEqual([
      `US09: birthday(${formatDate(lateDate)}) of child ${name}(${id}) should be within 9 months after death(${formatDate(death)}) of husband(${hid}).`
    ])
  })
})

describe('US10: marriageAfter14', function () {
  const marriageAfter14 = _validate.__get__('marriageAfter14')

  it('returns empty anomaly array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(marriageAfter14({indi, fami})).toEqual([])
  })

  it('returns array with only one anomaly: wife younger than 14', () => {
    const indi = new Map([
      [wid, new Indi(wid, name, sex, lateDate, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageAfter14({indi, fami})).toEqual([
      `US10: marriage ${formatDate(marriage)} of family(${fid}) should be 14 years after birth(${formatDate(lateDate)}) of wife(${wid}).`
    ])
  })

  it('returns array with only one anomaly: husband younger than 14', () => {
    const indi = new Map([
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, lateDate, undefined, famc, fams)]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)]
    ])

    expect(marriageAfter14({indi, fami})).toEqual([
      `US10: marriage ${formatDate(marriage)} of family(${fid}) should be 14 years after birth(${formatDate(lateDate)}) of husband(${hid}).`
    ])
  })
})

describe('US11: noBigamy', function () {
  const noBigamy = _validate.__get__('noBigamy')

  it('returns empty anomolies array', () => {
    const fami = new Map()

    expect(noBigamy({fami})).toEqual([])
  })

  it('returns array with only one anomily: wife overlapping marraiges', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
      [fid2, new Fami(fid2, hid2, wid, undefined, marriage, undefined)]
    ])

    expect(noBigamy({fami})).toEqual([`US11: wife(${wid}) marriage(${fid2}) on ${formatDate(marriage)} cannot have the same date as marriage(${fid}) on ${formatDate(marriage)}`])
  })

  it('returns array with only one anomily: husband overlapping marraiges', () => {
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)],
      [fid2, new Fami(fid2, hid, wid2, undefined, earlyDate, undefined)]
    ])

    expect(noBigamy({fami})).toEqual([`US11: husband(${hid}) marriage(${fid2}) on ${formatDate(earlyDate)} cannot occur during marriage(${fid}) on ${formatDate(marriage)}`])
  })
})

describe('US12: parentsNotTooOld', function () {
  const parentsNotTooOld = _validate.__get__('parentsNotTooOld')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(parentsNotTooOld({indi, fami})).toEqual([])
  })

  it('returns an empty anomalies array', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, birth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)]
    ])

    expect(parentsNotTooOld({indi, fami})).toEqual([])
  })

  it('returns an empty anomalies array', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, earlyDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage, divorce)]
    ])

    const husbAge = getAge(earlyDate, undefined)
    const childAge = getAge(cBirth, undefined)

    expect(parentsNotTooOld({indi, fami})).toEqual([`US12: husband(${hid}) age ${husbAge} of marriage: marriage(${fid}) cannot be 80 (total: ${husbAge - childAge}) years older than child ${id} of age ${childAge}`])
  })
})

describe('US13: siblingsSpacing', function () {
  const siblingsSpacing = _validate.__get__('siblingsSpacing')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(siblingsSpacing({indi, fami})).toEqual([])
  })

  it('returns an anomalies', () => {
    const badBirth = new Date(1992, 1, 10)

    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, badBirth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id, hid], marriage)]
    ])

    expect(siblingsSpacing({indi, fami})).toEqual([
      `US13: Family(${fid}), birth dates(${id}(${formatDate(cBirth)}) and ${hid}(${formatDate(badBirth)})) of siblings(${name}, ${name}) should be less than 2 days apart or more than 8 months apart.`
    ])
  })
})

describe('US14: multipleBirthsNoLargerThan5', function () {
  const multipleBirthsNoLargerThan5 = _validate.__get__('multipleBirthsNoLargerThan5')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(multipleBirthsNoLargerThan5({indi, fami})).toEqual([])
  })

  it('returns an anomalies', () => {
    const ids = [id, hid, hid2, wid, wid2, fid2]

    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, cBirth, undefined, famc, fams)],
      [hid2, new Indi(hid2, name, sex, cBirth, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, cBirth, undefined, famc, fams)],
      [wid2, new Indi(wid2, name, sex, cBirth, undefined, famc, fams)],
      [fid2, new Indi(fid2, name, sex, cBirth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, hid, wid, ids, marriage)]
    ])

    expect(multipleBirthsNoLargerThan5({indi, fami})).toEqual([
      `US14: Family(${fid}) should have no more than 5 siblings(${ids}) born at the same time(${formatDate(cBirth)})`
    ])
  })
})

describe('US15: fewerThan15Siblings', function () {
  const fewerThan15Siblings = _validate.__get__('fewerThan15Siblings')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(fewerThan15Siblings({indi, fami})).toEqual([])
  })

  it('returns an anomalies', () => {
    const cids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, cids, marriage)]
    ])

    expect(fewerThan15Siblings({fami})).toEqual([
      `US15: There should be fewer than 15 siblings in a family(${fid})`
    ])
  })
})

describe('US16: maleLastNames', function () {
  const maleLastNames = _validate.__get__('maleLastNames')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(maleLastNames({indi, fami})).toEqual([])
  })

  it('returns no anomaly', () => {
    const sameLastName = `${name} WHATEVER`
    const family = new Fami(fid, hid, wid, [id], marriage, divorce)
    family.hname = sameLastName

    const indi = new Map([
      [id, new Indi(id, sameLastName, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, sameLastName, sex, earlyDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, family]
    ])

    expect(maleLastNames({indi, fami})).toEqual([])
  })

  it('returns an anomalies', () => {
    const wrongName = 'FOO BAR'
    const family = new Fami(fid, hid, wid, [id], marriage, divorce)
    family.hname = name

    const indi = new Map([
      [id, new Indi(id, wrongName, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, earlyDate, undefined, famc, fams)],
      [wid, new Indi(wid, name, sex, birth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, family]
    ])

    expect(maleLastNames({indi, fami})).toEqual([
      `US16: All male members of a family(${fid}) should have the same last name`
    ])
  })
})

describe('US17: noMarriagesToDescendants', function () {
  const noMarriagesToDescendants = _validate.__get__('noMarriagesToDescendants')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(noMarriagesToDescendants({indi, fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, fid, [fid2])]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id], marriage)],
      [fid2, new Fami(fid2, id, wid, [], marriage)]
    ])

    expect(noMarriagesToDescendants({indi, fami})).toEqual([
      `US17: Mother(${wid}) should not marry to son(${id}) in family ${fid} and ${fid2}`
    ])
  })
})

describe('US18: siblingsShouldNotMarry', function () {
  const siblingsShouldNotMarry = _validate.__get__('siblingsShouldNotMarry')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(siblingsShouldNotMarry({indi, fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, fid, [fid2])]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id, wid2], marriage)],
      [fid2, new Fami(fid2, id, wid2, [], marriage)]
    ])

    expect(siblingsShouldNotMarry({indi, fami})).toEqual([
      `US18: Sibling(${id}) and sibling(${wid2}) should not be married in family(${fid2})`
    ])
  })
})

describe('US19: firstCousinsShouldNotMarry', function () {
  const firstCousinsShouldNotMarry = _validate.__get__('firstCousinsShouldNotMarry')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(firstCousinsShouldNotMarry({indi, fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [wid, new Indi(wid, name, sex, cBirth, undefined, undefined, ['fid'])],
      [hid, new Indi(hid, name, sex, cBirth, undefined, 'upperfid', ['fid'])],
      [id, new Indi(id, name, sex, cBirth, undefined, 'fid', [fid])],
      ['uncle', new Indi('uncle', name, sex, cBirth, undefined, 'upperfid', ['fid2'])],
      ['cousin', new Indi('cousin', name, sex, cBirth, undefined, 'fid2', [fid])]
    ])

    const fami = new Map([
      ['fid', new Fami('fid', hid, wid, [id], marriage)],
      ['upperfid', new Fami('upperfid', hid, wid, [hid, 'uncle'], marriage)],
      ['fid2', new Fami('fid2', 'uncle', wid, ['cousin'], marriage)]
    ])

    expect(firstCousinsShouldNotMarry({indi, fami})).toEqual([
      `US19: First cousins should not marry one another in family(${fid})`
    ])
  })
})

describe('US20: auntsAndUncles', function () {
  const auntsAndUncles = _validate.__get__('auntsAndUncles')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(auntsAndUncles({indi, fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [wid, new Indi(wid, name, sex, cBirth, undefined, undefined, ['fid'])],
      [hid, new Indi(hid, name, sex, cBirth, undefined, 'upperfid', ['fid'])],
      [id, new Indi(id, name, sex, cBirth, undefined, 'fid', [fid])],
      ['uncle', new Indi('uncle', name, sex, cBirth, undefined, 'upperfid', [fid])]
    ])

    const fami = new Map([
      ['fid', new Fami('fid', hid, wid, [id], marriage)],
      ['upperfid', new Fami('upperfid', hid, wid, [hid, 'uncle'], marriage)]
    ])

    expect(auntsAndUncles({indi, fami})).toEqual([
      `US20: Aunts/uncles and nieces/nephews should not be married in family(${fid})`
    ])
  })
})

describe('US21: correctGenderForRole', function () {
  const correctGenderForRole = _validate.__get__('correctGenderForRole')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(correctGenderForRole({indi, fami})).toEqual([])
  })

  it('returns an anomalies', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)]
    ])
    const fami = new Map([
      [fid, new Fami(fid, id, id, [], marriage)]
    ])

    expect(correctGenderForRole({indi, fami})).toEqual([
      `US21: Husband in family(${fid}) should be male and wife in family should be female`
    ])
  })
})

describe('US23: uniqueNameAndBirthDate', function () {
  const uniqueNameAndBirthDate = _validate.__get__('uniqueNameAndBirthDate')

  it('returns an empty anomalies array', () => {
    const indi = new Map()

    expect(uniqueNameAndBirthDate({indi})).toEqual([])
  })

  it('returns an anomalies', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, cBirth, undefined, famc, fams)]
    ])

    expect(uniqueNameAndBirthDate({indi})).toEqual([
      `US23: No more than one individual(${[id, hid]}) with the same name and birth date should appear in a GEDCOM file `
    ])
  })
})

describe('US24: uniqueFamiliesBySpouses', function () {
  const uniqueFamiliesBySpouses = _validate.__get__('uniqueFamiliesBySpouses')

  it('returns an empty anomalies array', () => {
    const fami = new Map()

    expect(uniqueFamiliesBySpouses({fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [wid, new Indi(wid, name, sex, cBirth, undefined, famc, fams)],
      [hid, new Indi(hid, name, sex, cBirth, undefined, famc, fams)],
      [hid2, new Indi(hid, name, sex, cBirth, undefined, famc, fams)],
      [wid2, new Indi(wid, name, sex, cBirth, undefined, famc, fams)],
    ])
    let fid = 'fid'
    let fid2 = 'fid2'
    let fidArray = [fid, fid2]

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [], marriage)],
      [fid2, new Fami(fid2, hid2, wid2, [], marriage)]
    ])

    expect(uniqueFamiliesBySpouses({fami})).toEqual(['US24: No more than one family(' + fidArray + ') with the same spouses by name should appear in a GEDCOM file'])
  })
})
describe('US25: uniqueFirstNamesInFamilies', function () {
  const uniqueFirstNamesInFamilies = _validate.__get__('uniqueFirstNamesInFamilies')

  it('returns an empty anomalies array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(uniqueFirstNamesInFamilies({indi, fami})).toEqual([])
  })

  it('returns an anomaly', () => {
    const indi = new Map([
      [id, new Indi(id, name, sex, cBirth, undefined, fid, [fid2])],
      [wid, new Indi(wid, name, sex, cBirth, undefined, fid, [fid2])]
    ])

    const fami = new Map([
      [fid, new Fami(fid, hid, wid, [id, wid], marriage)],
    ])

    expect(uniqueFirstNamesInFamilies({indi, fami})).toEqual([
      `US25: No more than one child(${id},${wid}) with the same name and birth date should appear in a family`
    ])
  })

})
