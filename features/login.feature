Feature: OrangeHRM Login

  Scenario: Successful login with valid credentials
    Given user open the OrangeHRM login page
    When user login with valid credentials
    Then user should see the dashboard
