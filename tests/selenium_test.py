import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

def run_aharsetu_e2e_test():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🚀 [1/5] Navigating to AharSetu Web Application...")
        driver.get("http://localhost:3000")
        time.sleep(2)

        print("🔑 [2/5] Triggering Sign In / Registration Modal...")
        signin_btn = driver.find_element(By.ID, "auth_signin_btn")
        signin_btn.click()
        time.sleep(1)

        print("📝 [3/5] Filling Registration Form...")
        fullname_input = driver.find_element(By.ID, "input_fullname")
        email_input = driver.find_element(By.ID, "input_email")
        password_input = driver.find_element(By.ID, "input_password")

        fullname_input.send_keys("Radisson Blu Hotel")
        email_input.send_keys(f"donor_{int(time.time())}@radisson.com")
        password_input.send_keys("SecurePass123!")

        submit_btn = driver.find_element(By.ID, "auth_submit_btn")
        submit_btn.click()
        time.sleep(2)

        print("🎭 [4/5] Testing Post-Login Role Selection Modal...")
        role_card = driver.find_element(By.ID, "role_card_donor")
        role_card.click()
        
        confirm_role_btn = driver.find_element(By.ID, "confirm_role_btn")
        confirm_role_btn.click()
        time.sleep(2)

        print("📊 [5/5] Verifying Donor Dashboard Empty State...")
        donor_dash = driver.find_element(By.ID, "donor_dashboard")
        assert donor_dash is not None, "Donor Dashboard failed to load!"
        
        print("✅ E2E Selenium Test Suite Executed Successfully!")

    finally:
        driver.quit()

if __name__ == "__main__":
    run_aharsetu_e2e_test()
