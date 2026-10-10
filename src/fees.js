const GRACE_PERIOD_DAYS = 2
const CENTS_PER_DAY = 25
const MAX_FEE_CENTS = 1000

function lateFee(daysLate) {
  if (!Number.isInteger(daysLate) || daysLate < 0) {
    throw new RangeError('daysLate must be a non-negative integer')
  }

  if (daysLate <= GRACE_PERIOD_DAYS) return 0

  return Math.min(daysLate * CENTS_PER_DAY, MAX_FEE_CENTS)
}

module.exports = { lateFee }
