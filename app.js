import puppeteer from "puppeteer";

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--ignore-certificate-errors",
      "--no-first-run",
      "--no-service-autorun",
      "--password-store=basic",
      "--system-developer-mode",
      // the following flags all try to reduce memory
      // '--single-process',
      "--mute-audio",
      "--disable-default-apps",
      "--no-zygote",
      "--disable-accelerated-2d-canvas",
      "--disable-web-security",
      // '--disable-gpu'
      // '--js-flags="--max-old-space-size=1024"'
    ],
  });

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.goto("https://www.youtube.com/feed/trending");
  const [rejectAll] = await page.$x("//button/span[contains(., 'Reject all')]");
  if (rejectAll) {
    await rejectAll.click();
  }

  await page.waitForSelector("#grid-container > ytd-video-renderer");
  const videos = await page.$$("#grid-container > ytd-video-renderer");
  const trends = [];
  for (const video of videos) {
    // Get title
    const titleTag = await video.$("#video-title > yt-formatted-string");
    const title = await titleTag.evaluate((el) => el.textContent);
    // Get channel
    const channelTag = await video.$("#text > a");
    const channel = await channelTag.evaluate((el) => el.textContent);

    trends.push({ channel, title });
  }

  console.log(trends);
  browser.close();
};

run();
