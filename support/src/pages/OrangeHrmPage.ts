import { Page } from 'playwright';

export class OrangeHrmPage {
    private page: Page;
    private dashboardSelector = '//h6[normalize-space(.)="Dashboard"]';
    private usernameSel = 'input[name="username"]';
    private passwordSel = 'input[name="password"]';
    private submitSel = 'button[type="submit"]';

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(process.env.BASE_URL!, { waitUntil: 'domcontentloaded' });
    }

    async login(username: string, password: string) {
        await this.page.fill(this.usernameSel, username);
        await this.page.fill(this.passwordSel, password);
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle' }),
            this.page.click(this.submitSel)
        ]);
    }

    async getDashboardHeaderText(): Promise<string | null> {
        await this.page.waitForSelector(this.dashboardSelector, { state: 'visible', timeout: 10000 });
        const text = await this.page.textContent(this.dashboardSelector);
        return text?.trim() ?? null;
    }
}