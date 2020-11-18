import puppeteer from 'puppeteer'
import { getTotp } from './totp.js'

import './bootstrap.js'

const initBrowser = () => puppeteer.launch({
  headless: process.env.DEBUG_MODE !== 'true',
  devtools: process.env.DEVTOOLS_ENABLED === 'true',
  defaultViewport: {
    width: 1366,
    height: 768,
  },
  args: [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
  ]
})

const initPage = async (browser) => {
  const page = await browser.newPage()

  await page.setBypassCSP(true)
  page.setDefaultTimeout(process.env.WAIT_TIMEOUT)

  return page
}

const login = async (page) => {
  const emailSelector    = 'input[type=email]'
  const passwordSelector = 'input[type=password]'
  const totpSelector     = 'input[name=otc]'
  const submitSelector   = 'input[type=submit]'

  await page.goto('https://teams.microsoft.com')

  // Email input
  await page.waitForSelector(emailSelector)
  const emailInput = await page.$(emailSelector)
  await emailInput.type(process.env.EMAIL)
  await emailInput.press('Enter')

  // Password input
  await page.waitForSelector(passwordSelector)
  const passwordInput = await page.$(passwordSelector)
  await passwordInput.type(process.env.PASSWORD)
  await page.waitForTimeout(1000)
  await passwordInput.press('Enter')

  // TOTP input
  await page.waitForSelector(totpSelector)
  const totp      = await getTotp()
  const totpInput = await page.$(totpSelector)
  await totpInput.type(totp)
  await totpInput.press('Enter')

  // Persist login confirm
  await page.waitForSelector(submitSelector)
  await page.waitForTimeout(1000)
  await page.click(submitSelector)
}

const clock = async (
  teamName,
  buttonName,
  confirmButtonName,
  teamSelectDescription,
  shiftsSidebarButtonName,
) => {
  const shiftsButtonSelector       = `button[aria-label="${shiftsSidebarButtonName}"]`
  const shiftsFrameName            = 'embedded-page-container'
  const teamButtonSelector         = `button[aria-label="${teamName} ${teamSelectDescription}"]`
  const clockButtonSelector        = `button[aria-label="${buttonName}"]`
  const clockConfirmButtonSelector = `button[aria-label="${confirmButtonName}"]`

  const browser = await initBrowser()
  const page    = await initPage(browser)

  // Login
  await login(page)

  // Sidebar click
  await page.waitForSelector(shiftsButtonSelector, { visible: true })
  await page.waitForTimeout(1000)
  await page.click(shiftsButtonSelector)

  // iframe search
  await page.waitForSelector('iframe')
  const pageFrames  = await page.frames()
  const shiftsFrame = pageFrames.find(f => f.name() === shiftsFrameName)

  if (!shiftsFrame) throw new Error('Shifts frame not found')

  // Team select
  await shiftsFrame.waitForSelector(teamButtonSelector, { visible: true })
  await shiftsFrame.click(teamButtonSelector)

  // Clock button select
  await shiftsFrame.waitForSelector(clockButtonSelector, { visible: true })
  await shiftsFrame.click(clockButtonSelector)

  // Confirm button select
  await shiftsFrame.waitForSelector(clockConfirmButtonSelector, { visible: true })
  await shiftsFrame.click(clockConfirmButtonSelector)

  await page.waitForTimeout(2000)

  if (process.env.TERMINATE_ON_FINISH !== 'false') await browser.close()
}

const getCommonVars = () => {
  const teamName                = process.env.TEAM_NAME || 'hoge'
  const confirmButtonName       = process.env.CONFIRM_BUTTON_NAME || 'はい'
  const teamSelectDescription   = process.env.TEAM_SELECT_DESC || 'のスケジュールを表示'
  const shiftsSidebarButtonName = process.env.SHIFTS_SIDEBAR_BUTTON_NAME || 'シフト ツールバー'

  return {
    teamName,
    confirmButtonName,
    teamSelectDescription,
    shiftsSidebarButtonName,
  }
}

export const clockIn = async () => {
  const {
    teamName,
    confirmButtonName,
    teamSelectDescription,
    shiftsSidebarButtonName,
  } = getCommonVars()

  const buttonName = process.env.CLOCK_IN_BUTTON_NAME || '出勤'

  await clock(
    teamName,
    buttonName,
    confirmButtonName,
    teamSelectDescription,
    shiftsSidebarButtonName,
  )
}

export const clockOut = async () => {
  const {
    teamName,
    confirmButtonName,
    teamSelectDescription,
    shiftsSidebarButtonName,
  } = getCommonVars()

  const buttonName = process.env.CLOCK_OUT_BUTTON_NAME || '退勤'

  await clock(
    teamName,
    buttonName,
    confirmButtonName,
    teamSelectDescription,
    shiftsSidebarButtonName,
  )
}
