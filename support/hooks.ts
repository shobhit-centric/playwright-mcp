import { BeforeAll, AfterAll, Before, After, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

setDefaultTimeout(60 * 1000);

class CustomWorld {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    attach: any;
    constructor({ attach }: any) {
        this.attach = attach;
    }
}
setWorldConstructor(CustomWorld);

let sharedBrowser: Browser;

BeforeAll(async () => {
    sharedBrowser = await chromium.launch({ headless: false });
});

AfterAll(async () => {
    if (sharedBrowser) await sharedBrowser.close();
});

Before(async function () {
    this.context = await sharedBrowser.newContext();
    this.page = await this.context.newPage();
});

After(async function (scenario) {
    try {
        if (scenario.result?.status === 'FAILED' && this.page) {
            const shot = await this.page.screenshot();
            if (this.attach) await this.attach(shot, 'image/png');
            const fs = require('fs');
            const path = `test-results/screenshots/${Date.now()}.png`;
            fs.mkdirSync('test-results/screenshots', { recursive: true });
            fs.writeFileSync(path, shot);
        }
    } catch (e) {
        // ignore
    } finally {
        if (this.page) await this.page.close();
        if (this.context) await this.context.close();
    }
});