jest.mock('./mailer')

const mailer = require('./mailer')
const { sendReminder, createReminderScheduler } = require('./reminders')

const loan = {
  code: 'LN-7KQ2XM',
  isbn: '9780134685991',
  memberId: 'm-001',
  memberEmail: 'ana@example.com',
  loanDate: '2026-03-01',
  plan: 'standard',
}

describe('sendReminder', () => {
  test('emails the member that the book is due', async () => {
    await sendReminder(loan)

    expect(mailer.send).toHaveBeenCalledTimes(1)
    expect(mailer.send).toHaveBeenCalledWith({
      to: 'ana@example.com',
      subject: 'Reminder: 9780134685991 is due on 2026-03-15',
      body: expect.any(String),
    })
  })

  test('throws for a loan without a member email, and sends nothing', () => {
    const loanWithoutEmail = { ...loan, memberEmail: undefined }

    expect(() => sendReminder(loanWithoutEmail)).toThrow('loan has no member email')
    expect(mailer.send).not.toHaveBeenCalled()
  })
})

describe('createReminderScheduler', () => {
  const loanDate = new Date('2026-03-01T00:00:00Z')
  const reminderTime = new Date('2026-03-14T09:00:00Z')
  let scheduler

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(loanDate)
    scheduler = createReminderScheduler()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('sends nothing one millisecond before 09:00 UTC on the day before the due date', () => {
    scheduler.schedule(loan)

    jest.advanceTimersByTime(reminderTime - loanDate - 1)

    expect(mailer.send).not.toHaveBeenCalled()
    expect(scheduler.pending()).toBe(1)
  })

  test('sends one reminder to the member at 09:00 UTC on the day before the due date', () => {
    scheduler.schedule(loan)

    jest.advanceTimersByTime(reminderTime - loanDate)

    expect(mailer.send).toHaveBeenCalledTimes(1)
    expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'ana@example.com' }))
    expect(scheduler.pending()).toBe(0)
  })

  test('never sends a cancelled reminder', () => {
    scheduler.schedule(loan)

    scheduler.cancel(loan.code)
    jest.advanceTimersByTime(reminderTime - loanDate)

    expect(mailer.send).not.toHaveBeenCalled()
    expect(scheduler.pending()).toBe(0)
  })
})
