'use strict'

class Fami {
  /**
   * construct family instance
   * @param  {string}   id       Unique family ID
   * @param  {string}   hid      Unique individual ID of husband
   * @param  {string}   wid      Unique individual ID of wife
   * @param  {string[]} cids     Unique individual ID of each child in the family
   * @param  {Date}     marriage Marriage date
   * @param  {Date}     divorce  Divorce date, if appropriate
   * @return {indi}              Family instance
   */
  constructor (id, hid, wid, cids = [], marriage, divorce) {
    if (!(id && hid && wid && marriage)) {
      throw Error(`Family is invalid.`)
    }

    this.id = id
    this.hid = hid
    this.wid = wid
    this.cids = cids
    this.marriage = marriage
    this.divorce = divorce
    this.hname = undefined
    this.wname = undefined
  }
}

module.exports = Fami
