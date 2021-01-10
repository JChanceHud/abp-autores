const puppeteer = require('puppeteer')

const { RESERVE_SLOT, RESERVE_TYPE, FIRST_NAME, MIDDLE_NAME, LAST_NAME, BIRTH_DAY, BIRTH_MONTH, BIRTH_YEAR, EMAIL, PHONE } = process.env

;(async () => {
  if (RESERVE_TYPE !== 'climbing' && RESERVE_TYPE !== 'fitness') {
    console.log('Invalid reservation type, specify either "climbing" or "fitness" for RESERVE_TYPE')
    process.exit(1)
  }
  if (!RESERVE_SLOT) {
    console.log('No RESERVE_SLOT specified')
    process.exit(1)
  }
  try {
    //for (;;) {
      await reserve()
    //}
  } catch (err) {
    console.log(err)
    console.log('Uncaught error')
    process.exit(1)
  }
})()


async function reserve() {
  const browser = await puppeteer.launch({
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
    executablePath: process.env.CHROME_BIN || null,
    headless: true,
  })
  const page = await browser.newPage()
  const url = RESERVE_TYPE === 'fitness' ?
    'https://austinboulderingproject.com/fitness-reservation' :
    'https://austinboulderingproject.com/climbing-reservation'
  await page.goto(url, {
    waitUntil: 'networkidle0',
  })
  await new Promise(r => setTimeout(r, 1000))
  const frames = await page.frames()
  const frame = frames.find(f => f.url().indexOf('https://app.rockgympro.com/b/widget') !== -1)
  if (!frame) {
    throw new Error('iFrame not found')
  }
  const participantSelectId = 'pcount-pid-1-45508'
  // 1 participant
  await frame.select(`#${participantSelectId}`, '1')
  const slots = await frame.$$('.offering-page-schedule-list-time-column')
  const texts = await Promise.all(slots.map(async (s) => ({
    slot: s,
    text: (await s.evaluate(e => e.innerText)),
  })))
  const _s = texts.find(({ text }) => text.toLowerCase().indexOf(RESERVE_SLOT.toLowerCase()) !== -1)
  if (!_s) {
    console.log('Invalid time slot')
    process.exit(0)
  }
  const { slot } = _s
  const parent = await slot.getProperty('parentNode')//'.book-now-button')
  const button = await parent.$('.book-now-button')
  if (!button) {
    console.log('Selection full!')
    process.exit(0)
  }
  await button.click()
  await frame.waitForSelector('#pfirstname-pindex-1-1', { visible: true, timeout: 10000 })
  await frame.type('#pfirstname-pindex-1-1', FIRST_NAME)
  await frame.type('#plastname-pindex-1-1', LAST_NAME)
  await frame.type('#pmiddle-pindex-1-1', MIDDLE_NAME)
  await frame.select('#participant-birth-pindex-1month', BIRTH_MONTH)
  await frame.select('#participant-birth-pindex-1day', BIRTH_DAY)
  await frame.select('#participant-birth-pindex-1year', BIRTH_YEAR)
  const options = [
    'Yes, I/we have completed new waivers',
    'Yes, I/we will abide by these new policies & standards',
    'I/we confirm the above',
  ]
  for (const option of options) {
    const optionEl = await frame.$(`option[value="${option}"]`)
    if (!optionEl) {
      console.log('Unable to find option')
      process.exit(1)
    }
    const select = await optionEl.getProperty('parentNode')
    await select.select(option)
  }
  const forward = await frame.$('.navforward')
  await forward.click()
  await frame.waitForSelector('#customer-email')
  await frame.type('#customer-email', EMAIL)
  await frame.type('#customer-phone', PHONE)
  await frame.hover('#confirm_booking_button')
  await browser.close()
  console.log('success')
}
