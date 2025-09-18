Feature: OrangeHRM Login

  Scenario: Successful login with valid credentials
    Given user open the OrangeHRM login page
    When user login with username "Admin" and password "admin123"
    Then user should see the dashboard

  Scenario: Failed login with invalid credentials
    Given user open the OrangeHRM login page
    When user login with username "wrong_user" and password "wrong_pass"
    Then user should see an error message

  Scenario: Failed login with blank username and valid password
    Given user open the OrangeHRM login page
    When user login with username "" and password "admin123"
    Then user should see an error message for blank fields

  Scenario: Failed login with blank password and valid username
    Given user open the OrangeHRM login page
    When user login with username "Admin" and password ""
    Then user should see an error message for blank fields  
