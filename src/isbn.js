function checkDigit(firstTwelveDigits) {
  const sum = [...firstTwelveDigits].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  )

  return (10 - (sum % 10)) % 10
}

function validateIsbn(value) {
  if (typeof value !== 'string') {
    throw new TypeError('isbn must be a string')
  }

  const digits = value.replace(/[-\s]/g, '')

  if (!/^\d{13}$/.test(digits)) {
    throw new Error('isbn must have 13 digits')
  }

  if (checkDigit(digits.slice(0, 12)) !== Number(digits[12])) {
    throw new Error('isbn checksum is invalid')
  }

  return digits
}

module.exports = { validateIsbn }
