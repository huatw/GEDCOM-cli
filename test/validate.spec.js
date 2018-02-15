'use strict'

const rewire = require('rewire')

const {formatDate} = require('../src/util')
const Indi = require('../src/models/Indi')
const Fami = require('../src/models/Fami')

const validate = require('../src/validate')
const _validate = rewire('../src/validate')

describe('validate', function () {
  //TODO
})

describe('US01: datesBeforeCurrentDate', function () {
  const datesBeforeCurrentDate = _validate.__get__('datesBeforeCurrentDate')

  const wrongDate = new Date(2222, 1, 1)

  const id = 'fake id'
  const name = 'fake name'
  const sex = 'M'
  const birth = new Date(1970, 1, 1)
  const death = new Date(2015, 1, 1)
  const famc = 'fake famc'
  const fams = []

  const fid = 'fake fid'
  const hid = 'fake hid'
  const wid = 'fake wid'
  const marriage = new Date(1990, 1, 1)
  const divorce = new Date(1995, 1, 1)

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

  const wrongDate = new Date(2222, 1, 1)

  const id = 'fake id'
  const name = 'fake name'
  const sex = 'M'
  const birth = new Date(1970, 1, 1)
  const death = new Date(2015, 1, 1)
  const famc = 'fake famc'
  const fams = []

  const fid = 'fake fid'
  const hid = 'fake hid'
  const wid = 'fake wid'
  const marriage = new Date(1990, 1, 1)
  const divorce = new Date(1995, 1, 1)

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

// TODO
// describe('US03: birthBeforeDeath', function () {
//   const birthBeforeDeath = _validate.__get__('birthBeforeDeath')
// })
// describe('US04: marriageBeforeDivorce', function () {
//   const marriageBeforeDivorce = _validate.__get__('marriageBeforeDivorce')
// })
// describe('US05: marriageBeforeDeath', function () {
//   const marriageBeforeDeath = _validate.__get__('marriageBeforeDeath')
// })
// describe('US06: divorceBeforeDeath', function () {
//   const divorceBeforeDeath = _validate.__get__('divorceBeforeDeath')
// })
// describe('US07: lessThen150YearsOld', function () {
//   const lessThen150YearsOld = _validate.__get__('lessThen150YearsOld')
// })
// describe('US08: birthBeforeMarriageOfParents', function () {
//   const birthBeforeMarriageOfParents = _validate.__get__('birthBeforeMarriageOfParents')
// })
// describe('US09: birthBeforeDeathOfParents', function () {
//   const birthBeforeDeathOfParents = _validate.__get__('birthBeforeDeathOfParents')
// })
// describe('US10: marriageAfter14', function () {
//   const marriageAfter14 = _validate.__get__('marriageAfter14')
// })
// describe('US11: noBigamy', function () {
//   const noBigamy = _validate.__get__('noBigamy')
// })
// describe('US12: parentsNotTooOld', function () {
//   const parentsNotTooOld = _validate.__get__('parentsNotTooOld')
// })
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
