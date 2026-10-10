const { dueDate, isOverdue, daysLate, sortByDueDate, formatReceipt } = require('./loans')
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

  test('does not change the list it was given', () => {
    const original = [...loans]

    sortByDueDate(loans)

    expect(loans).toEqual(original)
  })
})

describe('isOverdue and daysLate', () => {
  const loan = {
    code: 'LN-7KQ2XM',
    isbn: '9780134685991',
    memberId: 'm-001',
    memberEmail: 'ana@example.com',
    loanDate: '2026-03-01',
    plan: 'standard',
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('is not overdue at the last millisecond of the due date', () => {
    jest.setSystemTime(new Date('2026-03-15T23:59:59.999Z'))

    expect(isOverdue(loan)).toBe(false)
    expect(daysLate(loan)).toBe(0)
  })

  test('is overdue by one day at the first moment of the next day', () => {
    jest.setSystemTime(new Date('2026-03-16T00:00:00Z'))

    expect(isOverdue(loan)).toBe(true)
    expect(daysLate(loan)).toBe(1)
  })

  test('is never negative days late before the due date', () => {
    jest.setSystemTime(new Date('2026-03-10T12:00:00Z'))

    expect(daysLate(loan)).toBe(0)
  })
})

describe('formatReceipt', () => {
  const loan = {
    code: 'LN-7KQ2XM',
    isbn: '9780134685991',
    memberId: 'm-001',
    memberEmail: 'ana@example.com',
    loanDate: '2026-03-01',
    plan: 'standard',
  }

  const premiumLoan = {
    code: 'LN-AB3CD4',
    isbn: '9780201633610',
    memberId: 'm-002',
    memberEmail: 'bruno@example.com',
    loanDate: '2026-03-01',
    plan: 'premium',
  }

  test('formats a standard loan receipt', () => {
    expect(formatReceipt(loan)).toMatchSnapshot()
  })

  test('formats a premium loan receipt', () => {
    expect(formatReceipt(premiumLoan)).toMatchInlineSnapshot(`
"Bookshelf loan receipt
Code: LN-AB3CD4
Book: 9780201633610
Member: m-002
Borrowed: 2026-03-01
Due: 2026-03-29 (premium)"
`)
  })

  test('shows the due date with the plan in brackets', () => {
    expect(formatReceipt(loan)).toContain('Due: 2026-03-15 (standard)')
  })
})
