'use strict'

class Line {
  /**
   * construct line
   * @param  {number} level
   * @param  {string} tag
   * @param  {string} arg
   * @return {line}
   */
  constructor (level, tag, arg) {
    this.level = level
    this.tag = tag
    this.arg = arg
  }
}

module.exports = Line