import { clockIn, clockOut } from './browser.js'

const main = () => {
  const args = process.argv
  const type = args[2]

  if (type === 'in') return clockIn()
  if (type === 'out') return clockOut()

  throw new Error('Invalid arg!')
}

main()
