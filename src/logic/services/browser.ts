import puppeteer from 'puppeteer-extra';
import { Page, Browser } from 'puppeteer';
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

export class OsintBrowser {
    public browser: Browser | undefined;
    public page: Page | undefined;
    public url: string;

    constructor(url: string) {
        this.url = url;
    }

    public async initialize() {
        await this.buildBrowser();
    }

    private async buildBrowser() {
        // These args tell puppeteer to use the bundled chrome. This is safe for deploying to cloud run
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
        await this.page.goto(this.url, { waitUntil: 'networkidle2' });
        this.page.on('console', msg => {
            msg.args().forEach(arg => console.log(arg));
        });
        console.log("Browser Built");
    }

    public async close() {
        if (this.browser) {
            console.log("Browser Closed");
            await this.browser.close();
        }
    }
}