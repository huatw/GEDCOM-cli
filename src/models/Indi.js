'use strict'

class Indi {
  /**
   * construct individual instance
   * @param  {string}   id    Unique individual ID
   * @param  {string}   name  Name
   * @param  {string}   sex   Sex/Gender
   * @param  {string}   birth Birth date
   * @param  {string}   death Death date
   * @param  {string}   famc  Unique Family ID where the individual is a child
   * @param  {string[]} fams  Unique Family ID where the individual is a spouse
   * @return {indi}           Individual instance
   */
  constructor (id, name, sex, birth, death, famc, fams=[]) {
    if (!(id && name && sex && birth && (famc || fams.length>0))) {
      throw Error(`Individual is invalid.`)
    }

    this.id = id
    this.name = name
    this.sex = sex
    this.birth = birth
    this.death = death
    this.famc = famc
    this.fams = fams
  }
}

module.exports = Indi