// No I, L, O, 0, or 1: they are easy to misread on a printed receipt.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

function randomCharacter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
}

function generateLoanCode() {
  return `LN-${Array.from({ length: CODE_LENGTH }, randomCharacter).join('')}`
}

module.exports = { generateLoanCode }
