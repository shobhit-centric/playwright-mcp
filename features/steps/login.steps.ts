import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { OrangeHrmPage } from '../../support/src/pages/OrangeHrmPage';

Given('user open the OrangeHRM login page', async function () {
    const pageObj = new OrangeHrmPage(this.page);
    await pageObj.goto();
});

When('user login with valid credentials', async function () {
    const username = process.env.ORANGEHRM_USERNAME!;
    const password = process.env.ORANGEHRM_PASSWORD!;
    const pageObj = new OrangeHrmPage(this.page);
    await pageObj.login(username, password);
});

Then('user should see the dashboard', async function () {
    const pageObj = new OrangeHrmPage(this.page);
    const headerText = await pageObj.getDashboardHeaderText();
    assert.strictEqual(headerText, 'Dashboard', 'Dashboard header text mismatch');
});