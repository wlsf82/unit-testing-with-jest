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
})
