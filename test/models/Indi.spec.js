'use strict'

const Indi = require('../../src/models/Indi')

describe('Indi', function () {
  const id = 'fake ID'
  const name = 'fake name'
  const sex = 'M'
  const birth = new Date()
  const death = new Date()
  const famc = 'fake famc ID'
  const fams = ['fake fams ID']

  it('throws when missing any id, name, sex, birth, or both famc, fams', () => {
    expect(() => new Indi()).toThrow('Individual is invalid.')

    expect(() => new Indi(id)).toThrow('Individual is invalid.')

    expect(() => new Indi(id, name)).toThrow('Individual is invalid.')

    expect(() => new Indi(id, name, sex)).toThrow('Individual is invalid.')

    expect(() => new Indi(id, name, sex, birth)).toThrow('Individual is invalid.')
  })

  it('set props correctly', () => {
    expect(new Indi(id, name, sex, birth, death, undefined, fams))
      .toBeInstanceOf(Indi)

    expect(new Indi(id, name, sex, birth, death, famc))
      .toBeInstanceOf(Indi)

    const indi = new Indi(id, name, sex, birth, death, famc, fams)

    expect(indi).toBeInstanceOf(Indi)

    expect(indi.id).toBe(id)
    expect(indi.name).toBe(name)
    expect(indi.sex).toBe(sex)
    expect(indi.birth).toBe(birth)
    expect(indi.death).toBe(death)
    expect(indi.famc).toBe(famc)
    expect(indi.fams).toBe(fams)
  })
})
