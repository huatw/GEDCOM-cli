'use strict'

const Line = require('./models/Line')
const Indi = require('./models/Indi')
const Fami = require('./models/Fami')

const REVERSE_TYPES = new Map([[0, new Set(['INDI', 'FAM'])]])
const UNUSED_TYPES = new Map([[0, new Set(['HEAD', 'TRLR', 'NOTE'])]])
const SEXES = new Set(['M', 'F'])

/**
 * parse line instance to Date
 * @param {line} param0 
 * @return {date}
 */
const parseDate = ({level, tag, arg}) => {
  if (level === 2 && tag === 'DATE') {
    if (!Number.isNaN(Date.parse(arg))) {
      return new Date(arg)
    }
    throw Error(`Date is not valid: ${arg}`)
  }
  throw Error(`Level 2 Date tag expected: ${level} ${tag}`)
}

/**
 * transform multiple lines into individual
 * @param {line[]} lines 
 * @return {indi}
 */
const parseIndi = (lines) => {
  const id = lines[0].arg
  const fams = []
  let name, sex, birth, death, famc

  for (let i=1; i<lines.length; i++) {
    const {level, tag, arg} = lines[i]
    if (level === 1 && tag === 'NAME') {
      if (!name) {
        name = arg
      }
      else {
        throw Error(`NAME cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'SEX') {
      if (!sex) {
        if (!SEXES.has(arg)) {
          throw Error(`SEX should only be M or F: ${level} ${tag} ${arg}`)  
        }
        sex = arg
      }
      else {
        throw Error(`SEX cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'BIRT') {
      if (!birth) {
        i += 1
        birth = parseDate(lines[i])
      }
      else {
        throw Error(`BIRT cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'DEAT') {
      if (!death) {
        i += 1
        death = parseDate(lines[i])
      }
      else {
        throw Error(`DEAT cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'FAMC') {
      if (!famc) {
        famc = arg
      }
      else {
        throw Error(`FAMC cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'FAMS') {
      fams.push(arg)
    }
    else {
      throw Error(`Tag is not supported: ${tag}`)
    }
  }

  return new Indi(id, name, sex, birth, death, famc, fams)
}

/**
 * transform multiple lines into family
 * @param {line[]} lines 
 * @return {fami}
 */
const parseFami = (lines) => {
  const id = lines[0].arg
  const cids = []
  let hid, wid, marriage, divorce

  for (let i=1; i<lines.length; i++) {
    const {level, tag, arg} = lines[i]
    if (level === 1 && tag === 'MARR') {
      if (!marriage) {
        i += 1
        marriage = parseDate(lines[i])
      }
      else {
        throw Error(`MARR cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'HUSB') {
      if (!hid) {
        hid = arg
      }
      else {
        throw Error(`HUSB cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'WIFE') {
      if (!wid) {
        wid = arg
      }
      else {
        throw Error(`WIFE cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else if (level === 1 && tag === 'CHIL') {
      cids.push(arg)
    }
    else if (level === 1 && tag === 'DIV') {
      if (!divorce) {
        i += 1
        divorce = parseDate(lines[i])
      }
      else {
        throw Error(`DIV cannot be assigned multiple times: ${level} ${tag} ${arg}`)
      }
    }
    else {
      throw Error(`Tag is not supported: ${tag}`)
    }
  }

  return new Fami(id, hid, wid, cids, marriage, divorce)
}

const splitLines = str => str.trim().split(/\n/g)
const splitLine = lineStr => lineStr.trim().match(/^(\d+)\s+(\S+)\s*(.*)/)

/**
 * parse every line into line instance
 * @param {string} lineStr 
 * @return {line}
 */
const parseLine = lineStr => {
  const props = splitLine(lineStr)
  if (!props) {
    throw Error(`GENCOM Syntax Error at: ${lineStr}`)
  }

  const level = Number(props[1])

  const types = REVERSE_TYPES.get(level)
  if (types && types.has(props[3])) {
    return new Line(level, props[3], props[2])
  }

  return new Line(level, props[2], props[3])
}

/**
 * filter unused lines
 * @param {line} line 
 */
const filterTag = (line) => {
  const types = UNUSED_TYPES.get(line.level)
  return !(types && types.has(line.tag))
}

/**
 * group line under level 0
 * @param {object} acc 
 * @param {line} line 
 */
const groupLevel0 = (acc, line) => {
  if (line.level === 0) {
    acc.push([line])
  }
  else {
    acc[acc.length-1].push(line)
  }
  return acc
}

const TYPE_GEN_FNS = new Map([
  ['INDI', parseIndi],
  ['FAM', parseFami],
])

/**
 * transform lines to fami or indi
 * @param {lines} lines 
 */
const constructByType = lines => {
  const tag = lines[0].tag

  if (!TYPE_GEN_FNS.has(tag)) {
    throw Error(`Tag is not supported: ${tag}`)
  }

  return TYPE_GEN_FNS.get(tag)(lines)
}

/**
 * group instance by class type
 * @param {fami|indi} acc 
 * @param {object} obj 
 */
const groupByType = (acc, obj) => {
  if (obj instanceof Fami) {
    if (acc.fami.has(obj.id)) {
      throw Error(`Duplicated family: ${obj}`)
    }
    acc.fami.set(obj.id, obj)
    return acc
  }
  else if (obj instanceof Indi) {
    if (acc.indi.has(obj.id)) {
      throw Error(`Duplicated individual: ${obj}`)
    }
    acc.indi.set(obj.id, obj)
    return acc
  }
  throw Error(`Unknown instance: ${obj}`)
}

/**
 * parse raw string into {indi: new Map(), fami: new Map()}
 * @param {string} str 
 * @return {object}
 */
const parse = (str) => splitLines(str)
  .map(parseLine)
  .filter(filterTag)
  .reduce(groupLevel0, [])
  .map(constructByType)
  .reduce(groupByType, {indi: new Map(), fami: new Map()})

/**
 * normalize the output
 * add husband name and wife name to family table
 * sort lines
 * @param {object} param0 
 * @return {object}
 */
const normalize = ({indi, fami}) => {
  fami = Array.from(fami.values()).map(f => {
    f.hname = indi.get(f.hid).name
    f.wname = indi.get(f.wid).name
    return f
  })

  // note: should return 1 or -1, not boolean!
  // IDs are just strings, no specific format.
  indi = Array.from(indi.values()).sort((a, b) => a.id > b.id ? 1 : -1)
  fami = fami.sort((a, b) => a.id > b.id ? 1 : -1)
  return {indi, fami}
}

module.exports = {
  parse,
  normalize
}
