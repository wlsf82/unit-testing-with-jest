const { averageRating } = require('./ratings')

describe('averageRating', () => {
  test('returns the unrounded mean of the ratings', () => {
    expect(averageRating([4, 5, 5])).toBeCloseTo(4.667, 3)
  })

  test('returns the rating itself when there is only one', () => {
    expect(averageRating([3])).toBe(3)
  })

  test('returns null when there are no ratings', () => {
    expect(averageRating([])).toBeNull()
  })

  test('rejects a rating between 1 and 5 that is not an integer', () => {
    expect(() => averageRating([4, 4.5])).toThrow(
      new RangeError('ratings must be integers from 1 to 5'),
    )
  })
})
