'use strict'

const Table = require('cli-table2')

const {formatDate} = require('./util')

/**
 * create individual table string
 * @param {indi}  indi 
 * @return {string}
 */
function getIndiTable (indi) {
  const table = new Table({
    head: ['ID', 'Name', 'Sex', 'Birth', 'Age', 'Alive', 'Death', 'Child', 'Spouse']
  })

  indi.forEach(({id, name, sex, birth, death, famc, fams}) => {
    const age = (death || new Date()).getFullYear() - birth.getFullYear()
    const alive = death === undefined
    birth = formatDate(birth)
    death = formatDate(death)
    fams = fams.length > 0 ? fams.toString() : 'NA'
    famc = famc || 'NA'

    table.push(
      [id, name, sex, birth, age, alive, death, famc, fams]
    )
  })

  return table.toString()
}

/**
 * create family table string
 * @param  {fami} fami 
 * @return {string}
 */
function getFamiTable (fam) {
  const table = new Table({
    head: ['ID', 'Marrige', 'Divorce', 'Husband ID', 'Husband Name', 'Wife ID', 'Wife Name' ,'Children']
  })

  fam.forEach(({id, marrige, divorce, hid, wid, cids, wname, hname}) => {
    marrige = formatDate(marrige)
    divorce = formatDate(divorce)
    cids = cids.length > 0 ? cids.toString() : 'NA'

    table.push(
      [id, marrige, divorce, hid, hname, wid, wname, cids]
    )
  })

  return table.toString()
}

module.exports = { 
  getIndiTable, 
  getFamiTable 
}
