import puppeteer from "puppeteer";
import express from "express";

let trends = [];
const app = express();

app.get("/", (req, res) => {
  res.send(trends);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on", port);
});

const getTrends = async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
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
  trends = [];
  for (const video of videos) {
    // Get title
    const titleTag = await video.$("#video-title > yt-formatted-string");
    const title = await titleTag.evaluate((el) => el.textContent);
    // Get channel
    const channelTag = await video.$("#text > a");
    const channel = await channelTag.evaluate((el) => el.textContent);

    trends.push({ channel, title });
  }
  browser.close();

  setTimeout(getTrends, 1000 * 60 * 60);
};

getTrends();
