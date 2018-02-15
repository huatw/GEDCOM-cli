'use strict'

const {
  parse,
  normalize
} = require('../src/parser')

const Indi = require('../src/models/Indi')
const Fami = require('../src/models/Fami')

describe('parse', function () {
  it('returns empty family and individual map', () => {
    const str = '0 NOTE blabla'

    expect(parse(str)).toEqual({
      indi: new Map(),
      fami: new Map()
    })
  })

  it('returns parsed family and individual', () => {
    const fid = 'F23'
    const marriage = '14 FEB 1980'

    const sexM = 'M'
    const sexF = 'F'

    const hid = 'I01'
    const hname = 'Joe'
    const hbirth = '15 JUL 1960'
    const hdeath = '31 DEC 2013'

    const wid = 'I07'
    const wname = 'Jennifer'
    const wbirth = '23 SEP 1960'

    const cid1 = 'I26'
    const cname1 = 'Dick'
    const cbirth1 = '13 FEB 1981'

    const cid2 = 'I19'
    const cname2 = 'Jane'
    const cbirth2 = '2 JUN 1983'

    const cids = [cid1, cid2]

    const strHusband = `0 ${hid} INDI\n1 NAME ${hname}\n1 BIRT\n2 DATE ${hbirth}\n1 SEX ${sexM}\n1 FAMS ${fid}\n1 DEAT\n2 DATE ${hdeath}\n`
    const strWife = `0 ${wid} INDI\n1 NAME ${wname}\n1 BIRT\n2 DATE ${wbirth}\n1 SEX ${sexF}\n1 FAMS ${fid}\n`
    const strChild = `0 ${cid1} INDI\n1 NAME ${cname1}\n1 BIRT\n2 DATE ${cbirth1}\n1 SEX ${sexM}\n1 FAMC ${fid}\n`
    const strChild2 = `0 ${cid2} INDI\n1 NAME ${cname2}\n1 BIRT\n2 DATE ${cbirth2}\n1 SEX ${sexF}\n1 FAMC ${fid}\n`
    const strFam = `0 ${fid} FAM\n1 MARR\n2 DATE ${marriage}\n1 HUSB ${hid}\n1 WIFE ${wid}\n1 CHIL ${cid1}\n1 CHIL ${cid2}\n`

    const parsed = parse(strHusband + strWife + strChild + strChild2 + strFam)
    expect(parsed).toEqual({
      indi: new Map([
        [hid, new Indi(hid, hname, sexM, new Date(hbirth), new Date(hdeath), undefined, [fid])],
        [wid, new Indi(wid, wname, sexF, new Date(wbirth), undefined, undefined, [fid])],
        [cid1, new Indi(cid1, cname1, sexM, new Date(cbirth1), undefined, fid)],
        [cid2, new Indi(cid2, cname2, sexF, new Date(cbirth2), undefined, fid)],
      ]),
      fami: new Map([
        [fid, new Fami(fid, hid, wid, cids, new Date(marriage))]
      ])
    })
  })

  it('throws when GEDCOM has syntax error', () => {
    const str = `A NOTE C`

    expect(() => {
      parse(str)
    }).toThrow(`GENCOM Syntax Error at`)
  })

  it('throws when tag is not supported', () => {
    const tag = 'TEST'
    const str = `0 ${tag} blabla`

    expect(() => {
      parse(str)
    }).toThrow(`Tag is not supported: ${tag}`)
  })

  it('throws when date string is not valid', () => {
    const date = 'INVALID DATE'
    const str = `0 I07 INDI\n1 BIRT\n2 DATE ${date}`

    expect(() => {
      parse(str)
    }).toThrow(`Date is not valid: ${date}`)
  })

  it('throws when tag is not 2 date', () => {
    const invalidLevel = 3
    const level = 2
    const tag = 'DATE'
    const invalidTag = 'TEST'

    const str = `0 I07 INDI\n1 BIRT\n${invalidLevel} ${tag} 23 SEP 1960`
    const str2 = `0 I07 INDI\n1 BIRT\n${level} ${invalidTag} 23 SEP 1960`

    expect(() => {
      parse(str)
    }).toThrow(`Level 2 Date tag expected: ${invalidLevel} ${tag}`)

    expect(() => {
      parse(str2)
    }).toThrow(`Level 2 Date tag expected: ${level} ${invalidTag}`)
  })

  it('throws when individual name is assigned multiple times', () => {
    const str = `0 I07 INDI\n1 NAME Smith\n1 NAME Jennifer`

    expect(() => {
      parse(str)
    }).toThrow(`NAME cannot be assigned multiple times`)
  })

  it('throws when individual sex is assigned multiple times', () => {
    const str = `0 I07 INDI\n1 SEX F\n1 SEX F`

    expect(() => {
      parse(str)
    }).toThrow(`SEX cannot be assigned multiple times`)
  })

  it('throws when individual sex is not M or F', () => {
    const str = `0 I07 INDI\n1 SEX X`

    expect(() => {
      parse(str)
    }).toThrow(`SEX should only be M or F`)
  })

  it('throws when individual birthday is assigned multiple times', () => {
    const str = `0 I07 INDI\n1 BIRT\n2 DATE 15 JUL 1960\n1 BIRT`

    expect(() => {
      parse(str)
    }).toThrow(`BIRT cannot be assigned multiple times`)
  })

  it('throws when individual death is assigned multiple times', () => {
    const str = `0 I07 INDI\n1 DEAT\n2 DATE 31 DEC 2013\n1 DEAT`

    expect(() => {
      parse(str)
    }).toThrow(`DEAT cannot be assigned multiple times`)
  })

  it('throws when individual famc is assigned multiple times', () => {
    const str = `0 I07 INDI\n1 FAMC F23\n1 FAMC F23`

    expect(() => {
      parse(str)
    }).toThrow(`FAMC cannot be assigned multiple times`)
  })

  it('throws when family marriage is assigned multiple times', () => {
    const str = `0 F23 FAM\n1 MARR\n2 DATE 14 FEB 1980\n1 MARR`

    expect(() => {
      parse(str)
    }).toThrow(`MARR cannot be assigned multiple times`)
  })

  it('throws when family divorce is assigned multiple times', () => {
    const str = `0 F23 FAM\n1 DIV\n2 DATE 14 FEB 1980\n1 DIV`

    expect(() => {
      parse(str)
    }).toThrow(`DIV cannot be assigned multiple times`)
  })

  it('throws when family husband id is assigned multiple times', () => {
    const str = `0 F23 FAM\n1 HUSB I01\n1 HUSB I01`

    expect(() => {
      parse(str)
    }).toThrow(`HUSB cannot be assigned multiple times`)
  })

  it('throws when family wife id is assigned multiple times', () => {
    const str = `0 F23 FAM\n1 WIFE I07\n1 WIFE I07`

    expect(() => {
      parse(str)
    }).toThrow(`WIFE cannot be assigned multiple times`)
  })

  it('throws when individual id is duplicated', () => {
    const str = `0 I07 INDI\n1 NAME Jennifer\n1 BIRT\n2 DATE 23 SEP 1960\n1 SEX F\n1 FAMS F23\n`

    expect(() => {
      parse(str + str)
    }).toThrow(`Duplicated individual`)
  })

  it('throws when family id is duplicated', () => {
    const str = `0 F23 FAM\n1 MARR\n2 DATE 14 FEB 1980\n1 HUSB I01\n1 WIFE I07\n`

    expect(() => {
      parse(str + str)
    }).toThrow(`Duplicated family`)
  })
})

describe('normalize', function () {
  const sex = 'M'
  const birth = new Date(2222, 9, 1)
  const death = undefined
  const famc = 'fake famc'
  const fams = []

  const cids = []
  const marriage = new Date()
  const divorce = new Date()

  it('returns object with sorted family and individual array', () => {
    const iids = ['iid1', 'iid2', 'iid3', 'iid4']
    const names = ['name1', 'name2', 'name3', 'name4']

    const indi1 = new Indi(iids[0], names[0], sex, birth, death, famc, fams)
    const indi2 = new Indi(iids[1], names[1], sex, birth, death, famc, fams)
    const indi3 = new Indi(iids[2], names[2], sex, birth, death, famc, fams)
    const indi4 = new Indi(iids[3], names[3], sex, birth, death, famc, fams)

    const indi = new Map([
      [iids[1], indi2],
      [iids[0], indi1],
      [iids[3], indi4],
      [iids[2], indi3],
    ])

    const fids = ['fid1', 'fid2', 'fid3', 'fid4']
    const hids = iids
    const wids = iids

    const fami1 = new Fami(fids[0], hids[0], wids[0], cids, marriage, divorce)
    const fami2 = new Fami(fids[1], hids[1], wids[1], cids, marriage, divorce)
    const fami3 = new Fami(fids[2], hids[2], wids[2], cids, marriage, divorce)
    const fami4 = new Fami(fids[3], hids[3], wids[3], cids, marriage, divorce)

    const fami = new Map([
      [fids[1], fami2],
      [fids[0], fami1],
      [fids[3], fami4],
      [fids[2], fami3],
    ])

    expect(normalize({indi, fami})).toEqual({
      indi: [indi1, indi2, indi3, indi4],
      fami: [fami1, fami2, fami3, fami4]
    })
  })

  it('returns object with family that has husband and wife name', () => {
    const hid = 'fake hid'
    const hname = 'fake hname'
    const wid = 'fake wid'
    const wname = 'fake wname'


    const husband = new Indi(hid, hname, sex, birth, death, famc, fams)
    const wife = new Indi(wid, wname, sex, birth, death, famc, fams)

    const indi = new Map([
      [hid, husband],
      [wid, wife]
    ])

    const fid = 'fake fid'

    const fami1 = new Fami(fid, hid, wid, cids, marriage, divorce)

    const fami = new Map([[fid, fami1]])

    const famiArr = normalize({indi, fami}).fami

    expect(famiArr[0].hname).toEqual(hname)
    expect(famiArr[0].wname).toEqual(wname)
  })

  it('returns object with empty family and individual array', () => {
    const indi = new Map()
    const fami = new Map()

    expect(normalize({indi, fami})).toEqual({
      indi: [],
      fami: []
    })
  })
})
