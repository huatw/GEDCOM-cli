'use strict'

const Fami = require('../../src/models/Fami')
// id, hid, wid, cids, marriage, divorce,
describe('Fami', function () {
  const id = 'fake ID'
  const hid = 'fake hid'
  const wid = 'fake wid'
  const cids = ['fake cID']
  const marriage = new Date()
  const divorce = new Date()

  it('throws when missing any id, hid, wid, marriage', () => {
    expect(() => new Fami()).toThrow('Family is invalid.')

    expect(() => new Fami(id)).toThrow('Family is invalid.')

    expect(() => new Fami(id, hid)).toThrow('Family is invalid.')

    expect(() => new Fami(id, hid, wid)).toThrow('Family is invalid.')

    expect(() => new Fami(id, hid, wid, cids)).toThrow('Family is invalid.')
  })

  it('set props correctly', () => {
    expect(new Fami(id, hid, wid, cids, marriage))
      .toBeInstanceOf(Fami)

    const fami = new Fami(id, hid, wid, cids, marriage, divorce)

    expect(fami).toBeInstanceOf(Fami)

    expect(fami.id).toBe(id)
    expect(fami.hid).toBe(hid)
    expect(fami.wid).toBe(wid)
    expect(fami.cids).toBe(cids)
    expect(fami.marriage).toBe(marriage)
    expect(fami.divorce).toBe(divorce)
  })
})
