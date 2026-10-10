const { createLoanRegistry } = require('./registry')

const ana = {
  memberId: 'm-001',
  memberEmail: 'ana@example.com',
  loanDate: '2026-03-01',
  plan: 'standard',
}

describe('createLoanRegistry', () => {
  let registry

  beforeEach(() => {
    registry = createLoanRegistry()
  })

  test('borrowing a book returns a loan for that ISBN', () => {
    const loan = registry.borrow({ ...ana, isbn: '978-0-13-468599-1' })

    expect(loan.isbn).toBe('9780134685991')
  })

  test('borrowing a book that is already on loan throws', () => {
    registry.borrow({ ...ana, isbn: '9780134685991' })

    expect(() => registry.borrow({ ...ana, isbn: '9780134685991' })).toThrow(
      'book is already on loan',
    )
  })

  test('counts one book out after one is borrowed', () => {
    registry.borrow({ ...ana, isbn: '9780134685991' })

    expect(registry.count()).toBe(1)
  })

  test('lets a member hold 3 loans and rejects a fourth', () => {
    registry.borrow({ ...ana, isbn: '9780134685991' })
    registry.borrow({ ...ana, isbn: '9780201633610' })
    registry.borrow({ ...ana, isbn: '9780132350884' })

    expect(() => registry.borrow({ ...ana, isbn: '9780201616224' })).toThrow(
      'member has reached the loan limit',
    )
  })
})
