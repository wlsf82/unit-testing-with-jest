const { generateLoanCode } = require('./loan-code')

describe('generateLoanCode', () => {
  test('picks the first character of the alphabet when Math.random() is 0', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0)

    expect(generateLoanCode()).toBe('LN-AAAAAA')
  })

  test('picks the last character of the alphabet when Math.random() is close to 1', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9999)

    expect(generateLoanCode()).toBe('LN-999999')
  })

  test('follows the README format', () => {
    expect(generateLoanCode()).toMatch(/^LN-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/)
  })
})
