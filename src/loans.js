const DAY_IN_MS = 24 * 60 * 60 * 1000

const LOAN_DAYS = {
  standard: 14,
  premium: 28,
}

function parseDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN

  const time = Date.parse(`${date}T00:00:00Z`)

  // Date.parse rolls impossible dates over (2026-02-30 becomes March 2nd),
  // so a date only counts when it survives the round trip unchanged.
  if (Number.isNaN(time) || toDateString(time) !== date) return NaN

  return time
}

function toDateString(time) {
  return new Date(time).toISOString().slice(0, 10)
}

function today() {
  return Date.parse(`${toDateString(Date.now())}T00:00:00Z`)
}

function dueDate(loanDate, plan) {
  const start = parseDate(loanDate)

  if (Number.isNaN(start)) {
    throw new Error('loanDate must be a YYYY-MM-DD date')
  }

  if (!Object.hasOwn(LOAN_DAYS, plan)) {
    throw new Error('plan must be standard or premium')
  }

  return toDateString(start + LOAN_DAYS[plan] * DAY_IN_MS)
}

function isOverdue(loan) {
  return daysLate(loan) > 0
}

function daysLate(loan) {
  const due = Date.parse(`${dueDate(loan.loanDate, loan.plan)}T00:00:00Z`)

  return Math.max(0, Math.round((today() - due) / DAY_IN_MS))
}

function byDueDateThenIsbn(a, b) {
  const dueA = dueDate(a.loanDate, a.plan)
  const dueB = dueDate(b.loanDate, b.plan)

  if (dueA !== dueB) return dueA < dueB ? -1 : 1
  if (a.isbn === b.isbn) return 0

  return a.isbn < b.isbn ? -1 : 1
}

function sortByDueDate(loans) {
  return loans.sort(byDueDateThenIsbn)
}

function formatReceipt(loan) {
  return [
    'Bookshelf loan receipt',
    `Code: ${loan.code}`,
    `Book: ${loan.isbn}`,
    `Member: ${loan.memberId}`,
    `Borrowed: ${loan.loanDate}`,
    `Due: ${dueDate(loan.loanDate, loan.plan)} (${loan.plan})`,
  ].join('\n')
}

module.exports = {
  dueDate,
  isOverdue,
  daysLate,
  sortByDueDate,
  formatReceipt,
}
