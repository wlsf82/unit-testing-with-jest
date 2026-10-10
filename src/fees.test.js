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

  test.each`
    daysLate | fee
    ${0}     | ${0}
    ${2}     | ${0}
    ${3}     | ${75}
    ${39}    | ${975}
    ${40}    | ${1000}
    ${41}    | ${1000}
  `('charges $fee cents for $daysLate days late', ({ daysLate, fee }) => {
    expect(lateFee(daysLate)).toBe(fee)
  })

  describe.each([[-1], [1.5], ['3'], [null]])('lateFee(%p)', (daysLate) => {
    test('throws a RangeError', () => {
      expect(() => lateFee(daysLate)).toThrow(RangeError)
      expect(() => lateFee(daysLate)).toThrow('daysLate must be a non-negative integer')
    })
  })
})
