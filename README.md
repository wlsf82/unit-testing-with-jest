# Unit Testing with Jest

The **Bookshelf**: the lending logic of a small library, used in the [Unit Testing with Jest](https://talkingabouttesting.school/courses/unit-testing-with-jest) course at the [Talking About Testing School](https://talkingabouttesting.school).

It was built for the course and is not a production system. There is no server, no user interface, and no database: only small JavaScript modules in `src/`, each one a set of business rules to test.

> ⚠️ **There are no tests yet. You will write them.** And the code is not perfect: like most code you will meet at work, it looks fine at first glance. Please do not open an issue or a pull request to fix it. Finding out, with tests, is the point of the course.

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer
- npm, which comes with Node.js

The modules have no dependencies. No Docker is needed.

## The business rules

This section is the **specification**. A test checks these rules, not what the code happens to do.

The modules use CommonJS (`require` and `module.exports`).

All dates are **UTC calendar dates** written as `YYYY-MM-DD` strings, so the results never depend on your time zone.

### `src/fees.js`: `lateFee(daysLate)`

Returns the late fee for a book returned `daysLate` days after its due date, in **integer cents**.

- Up to **2 days late is free**: `0`, `1`, and `2` return `0`.
- From the 3rd day on, **25 cents for every day late**, counting all of them: `3` returns `75`, and `10` returns `250`.
- The fee is **capped at 1000** cents: `39` returns `975`, and `40` and `41` both return `1000`.
- Anything that is not a non-negative integer (such as `-1`, `1.5`, `'3'`, or `null`) throws `RangeError('daysLate must be a non-negative integer')`.

Amounts are kept in integer cents on purpose: money in floating-point numbers is a bug of its own.

### `src/isbn.js`: `validateIsbn(value)`

Accepts an ISBN-13, with or without hyphens and spaces, and returns its 13 digits: `'978-0-13-468599-1'` returns `'9780134685991'`.

- Not a string: throws `TypeError('isbn must be a string')`.
- Not 13 digits after removing hyphens and spaces: throws `Error('isbn must have 13 digits')`.
- Wrong check digit (the last digit, computed from the other twelve): throws `Error('isbn checksum is invalid')`.
- The checks run in that order, and the first one that fails answers.

### `src/ratings.js`: `averageRating(ratings)`

Ratings are **integers from 1 to 5**. Returns their mean, unrounded: `[4, 5, 5]` returns `4.666...`.

- An empty array returns **`null`** (not `0`, and not `undefined`).
- Not an array: throws `TypeError('ratings must be an array')`.
- Any rating that is not an integer from 1 to 5: throws `RangeError('ratings must be integers from 1 to 5')`.

### `src/loans.js`

A loan looks like this:

```js
{
  code: 'LN-7KQ2XM',
  isbn: '9780134685991',
  memberId: 'm-001',
  memberEmail: 'ana@example.com',
  loanDate: '2026-03-01',
  plan: 'standard',
}
```

- `dueDate(loanDate, plan)` returns the due date as `YYYY-MM-DD`: the `standard` plan adds **14** days and the `premium` plan adds **28**. `dueDate('2026-03-01', 'standard')` returns `'2026-03-15'`.
  - An unknown plan throws `Error('plan must be standard or premium')`.
  - A malformed date throws `Error('loanDate must be a YYYY-MM-DD date')`.
- `isOverdue(loan)` reads today's date (UTC) and returns `true` when today is **after** the due date. On the due date itself, a loan is not overdue.
- `daysLate(loan)` returns the whole days between the due date and today (UTC). It is never negative.
- `sortByDueDate(loans)` returns a **new** array sorted by due date, earliest first, with ties broken by `isbn`. **It must not change the array it was given.**
- `formatReceipt(loan)` returns a receipt as a multi-line string, exactly like this:

```text
Bookshelf loan receipt
Code: LN-7KQ2XM
Book: 9780134685991
Member: m-001
Borrowed: 2026-03-01
Due: 2026-03-15 (standard)
```

### `src/loan-code.js`: `generateLoanCode()`

Returns `'LN-'` followed by **6 random characters** from the alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. The letters `I`, `L`, and `O` and the digits `0` and `1` are left out, because they are easy to misread.

Each character is picked with `Math.random()`, so `Math.random()` returning `0` gives `LN-AAAAAA`, and returning `0.9999` gives `LN-999999`.

### `src/registry.js`: `createLoanRegistry({ maxLoansPerMember = 3 } = {})`

Each call returns a new, independent registry of the books currently on loan, with:

- `borrow({ isbn, memberId, memberEmail, loanDate, plan })` returns the new loan, with the ISBN normalized by `validateIsbn()` and a fresh code from `generateLoanCode()`.
  - It throws `Error('book is already on loan')` when that book is out.
  - It throws `Error('member has reached the loan limit')` when the member already holds `maxLoansPerMember` loans (**3** unless the registry was created with another limit, such as `createLoanRegistry({ maxLoansPerMember: 5 })`).
- `giveBack(isbn)` returns the returned loan, and throws `Error('book is not on loan')` when it is not out.
- `loansOf(memberId)` returns a **copy** of that member's loans: changing it does not change the registry.
- `count()` returns how many books are out.

The module also exports a ready-made, shared `registry`, the way an application might wire one up.

### `src/catalog.js`: `createCatalog(httpClient)`

Looks books up in a remote catalog and returns `{ findBook }`.

The HTTP client is **passed in** (injected), so the module never talks to the network by itself. `httpClient.get(path)` resolves `{ status, body }` for any HTTP response, and rejects when the network fails.

`findBook(isbn)` is `async`. It validates the ISBN first (an invalid one rejects with `validateIsbn()`'s error, and the catalog is not asked), then calls `httpClient.get('/books/<13 digits>')`:

- `200` resolves `{ isbn, title, author }`, dropping any other field of the body.
- `404` resolves `null`.
- Any other status rejects with `Error('catalog unavailable')`.
- A network failure (a rejected `get()`) also rejects with `Error('catalog unavailable')`.

### `src/mailer.js`: `send({ to, subject, body })`

The real email client. It posts the email to the URL in the `MAIL_API_URL` environment variable and returns a promise.

When `MAIL_API_URL` is not set, it throws `Error('MAIL_API_URL is not set')` instead of sending anything. Tests should never call it for real.

### `src/reminders.js`

This module **requires** `./mailer` directly: the mailer is not passed in.

- `sendReminder(loan)` sends an email to the loan's `memberEmail` with the subject `Reminder: <isbn> is due on <due date>`, and returns the mailer's promise. A loan without a `memberEmail` throws `Error('loan has no member email')`.
- `createReminderScheduler()` returns `{ schedule(loan), cancel(code), pending() }`:
  - `schedule(loan)` sends the loan's reminder at **09:00 UTC on the day before the due date**, or right away if that moment has already passed. Scheduling the same loan code again replaces its reminder.
  - `cancel(code)` stops the scheduled reminder of that loan code.
  - `pending()` returns how many reminders are waiting to be sent.

## License

[MIT](./LICENSE)
