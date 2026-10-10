const mailer = require('./mailer')
const { dueDate } = require('./loans')

const DAY_IN_MS = 24 * 60 * 60 * 1000

// Node.js fires any timer longer than this after 1 ms, so longer waits
// are split into a chain of shorter timers.
const MAX_TIMER_DELAY_MS = 2 ** 31 - 1

function sendReminder(loan) {
  if (!loan.memberEmail) {
    throw new Error('loan has no member email')
  }

  const due = dueDate(loan.loanDate, loan.plan)

  return mailer.send({
    to: loan.memberEmail,
    subject: `Reminder: ${loan.isbn} is due on ${due}`,
    body: `Hello! The book ${loan.isbn}, borrowed on ${loan.loanDate} (loan ${loan.code}), is due back on ${due}.`,
  })
}

function reminderTime(loan) {
  const due = dueDate(loan.loanDate, loan.plan)

  return Date.parse(`${due}T09:00:00Z`) - DAY_IN_MS
}

function createReminderScheduler() {
  const timers = new Map()

  async function deliver(loan) {
    timers.delete(loan.code)

    try {
      await sendReminder(loan)
    } catch (error) {
      console.error(`Could not send the reminder for loan ${loan.code}: ${error.message}`)
    }
  }

  function wait(loan, sendAt) {
    const delay = Math.max(0, sendAt - Date.now())

    if (delay > MAX_TIMER_DELAY_MS) {
      timers.set(loan.code, setTimeout(() => wait(loan, sendAt), MAX_TIMER_DELAY_MS))
      return
    }

    timers.set(loan.code, setTimeout(() => deliver(loan), delay))
  }

  function schedule(loan) {
    cancel(loan.code)
    wait(loan, reminderTime(loan))
  }

  function cancel(code) {
    clearTimeout(timers.get(code))
    timers.delete(code)
  }

  function pending() {
    return timers.size
  }

  return { schedule, cancel, pending }
}

module.exports = { sendReminder, createReminderScheduler }
