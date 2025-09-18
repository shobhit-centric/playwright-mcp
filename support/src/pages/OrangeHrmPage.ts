import { Page } from 'playwright';

export class OrangeHrmPage {
    private page: Page;
    private dashboardSelector = '//h6[normalize-space(.)="Dashboard"]';
    private usernameSel = 'input[name="username"]';
    private passwordSel = 'input[name="password"]';
    private submitSel = 'button[type="submit"]';
    private errorMessageSel = '//p[text()="Invalid credentials"]';
    private blankErrorMessageSel = '//span[text()="Required"]';

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(process.env.BASE_URL!, { waitUntil: 'domcontentloaded' });
    }

    async enterCredentials(username: string, password: string) {
        await this.page.fill(this.usernameSel, username);
        await this.page.fill(this.passwordSel, password);
    }

    async clickLogin() {
         await Promise.all([
            // this.page.waitForNavigation({ waitUntil: 'networkidle' }),
            this.page.click(this.submitSel)
        ]);
    }

    async login(username: string, password: string): Promise<void> {       
        await this.enterCredentials(username, password);
        await this.clickLogin();                
    }

    async getDashboardHeaderText(): Promise<string | null> {
        await this.page.waitForSelector(this.dashboardSelector, { state: 'visible', timeout: 10000 });
        const text = await this.page.textContent(this.dashboardSelector);
        return text?.trim() ?? null;
    }
    getErrorMessage() {
    return this.page.locator(this.errorMessageSel);
  }
  getBlankErrorMessage() {
    return this.page.locator(this.blankErrorMessageSel);
  }
  async getErrorMessageText(): Promise<string> {
    const locator = this.getErrorMessage();
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    const text = await locator.innerText();
    return text.trim();
  }
  async getErrorMessageBlankText(): Promise<string> {
    const locator = this.getBlankErrorMessage();
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    const text = await locator.innerText();
    return text.trim();
  }
}
