const { dueDate, sortByDueDate } = require('./loans')
const { createLoanRegistry } = require('./registry')

describe('dueDate', () => {
  test('adds 14 days on the standard plan', () => {
    expect(dueDate('2026-03-01', 'standard')).toBe('2026-03-15')
  })

  test('adds 28 days on the premium plan', () => {
    expect(dueDate('2026-03-01', 'premium')).toBe('2026-03-29')
  })

  test('crosses into the next month', () => {
    expect(dueDate('2026-03-25', 'standard')).toBe('2026-04-08')
  })
})

describe('a borrowed loan', () => {
  const borrowing = {
    isbn: '978-0-13-468599-1',
    memberId: 'm-001',
    memberEmail: 'ana@example.com',
    loanDate: '2026-03-01',
    plan: 'standard',
  }

  test('has the normalized ISBN, the member, the date, the plan, and a loan code', () => {
    const registry = createLoanRegistry()

    const loan = registry.borrow(borrowing)

    expect(loan).toMatchObject({
      isbn: '9780134685991',
      memberId: 'm-001',
      memberEmail: 'ana@example.com',
      loanDate: '2026-03-01',
      plan: 'standard',
    })
    expect(loan.code).toMatch(/^LN-/)
  })

  test('has exactly those fields, with any string as its code', () => {
    const registry = createLoanRegistry()

    const loan = registry.borrow(borrowing)

    expect(loan).toEqual({
      code: expect.any(String),
      isbn: '9780134685991',
      memberId: 'm-001',
      memberEmail: 'ana@example.com',
      loanDate: '2026-03-01',
      plan: 'standard',
    })
  })
})

describe('sortByDueDate', () => {
  const later = { isbn: '9780201633610', memberId: 'm-002', loanDate: '2026-03-10', plan: 'standard' }
  const sooner = { isbn: '9780134685991', memberId: 'm-001', loanDate: '2026-03-01', plan: 'standard' }
  const longest = { isbn: '9780132350884', memberId: 'm-003', loanDate: '2026-03-01', plan: 'premium' }
  const loans = [later, sooner, longest]

  test('returns the loans earliest due first', () => {
    expect(sortByDueDate(loans)).toEqual([sooner, later, longest])
  })

  test('the first loan in the list is due on March 24', () => {
    expect(dueDate(loans[0].loanDate, loans[0].plan)).toBe('2026-03-24')
  })
})
