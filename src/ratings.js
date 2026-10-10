function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

function averageRating(ratings) {
  if (!Array.isArray(ratings)) {
    throw new TypeError('ratings must be an array')
  }

  if (!ratings.every(isValidRating)) {
    throw new RangeError('ratings must be integers from 1 to 5')
  }

  if (ratings.length === 0) return null

  const total = ratings.reduce((sum, rating) => sum + rating, 0)

  return total / ratings.length
}

module.exports = { averageRating }
