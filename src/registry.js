const { validateIsbn } = require('./isbn')
const { generateLoanCode } = require('./loan-code')

function createLoanRegistry({ maxLoansPerMember = 3 } = {}) {
  const loansByIsbn = new Map()
  const loansByMember = new Map()

  function borrow({ isbn, memberId, memberEmail, loanDate, plan }) {
    const normalizedIsbn = validateIsbn(isbn)

    if (loansByIsbn.has(normalizedIsbn)) {
      throw new Error('book is already on loan')
    }

    const memberLoans = loansByMember.get(memberId) ?? []

    if (memberLoans.length >= maxLoansPerMember) {
      throw new Error('member has reached the loan limit')
    }

    const loan = {
      code: generateLoanCode(),
      isbn: normalizedIsbn,
      memberId,
      memberEmail,
      loanDate,
      plan,
    }

    loansByIsbn.set(normalizedIsbn, loan)
    loansByMember.set(memberId, [...memberLoans, loan])

    return loan
  }

  function giveBack(isbn) {
    const normalizedIsbn = validateIsbn(isbn)
    const loan = loansByIsbn.get(normalizedIsbn)

    if (!loan) {
      throw new Error('book is not on loan')
    }

    loansByIsbn.delete(normalizedIsbn)
    loansByMember.set(
      loan.memberId,
      loansByMember.get(loan.memberId).filter((memberLoan) => memberLoan !== loan),
    )

    return loan
  }

  function loansOf(memberId) {
    return [...(loansByMember.get(memberId) ?? [])]
  }

  function count() {
    return loansByIsbn.size
  }

  return { borrow, giveBack, loansOf, count }
}

const registry = createLoanRegistry()

module.exports = { createLoanRegistry, registry }
