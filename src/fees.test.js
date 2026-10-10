const { lateFee } = require('./fees')

describe('lateFee', () => {
  test('charges nothing for a book returned on time', () => {
    expect(lateFee(0)).toBe(0)
  })

  test('charges 25 cents for each day late', () => {
    expect(lateFee(10)).toBe(250)
  })

  test('charges 500 cents for a book 20 days late', () => {
    expect(lateFee(20)).toBe(500)
  })
})
