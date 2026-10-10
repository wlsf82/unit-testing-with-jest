jest.mock('./mailer')

const mailer = require('./mailer')
const { sendReminder } = require('./reminders')

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
