# -*- coding: utf-8 -*-
import sys
import io
import time
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8080"
passed = []
failed = []

def record(name, status, details=""):
    if status:
        passed.append(name)
        print(f"[PASS] {name} {details}", flush=True)
    else:
        failed.append(name)
        print(f"[FAIL] {name} {details}", flush=True)

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("--- STARTING FIX_SPEC QA VERIFICATION ---", flush=True)

        # 1. Homepage & Header UX
        print("\n[Test 1: Homepage & Header UX]", flush=True)
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        brand_text = page.locator(".logis-brand-text .brand-name").inner_text()
        record("Header Brand Name", "PREEYA SYSTEMS" in brand_text, brand_text)

        badge_text = page.locator(".topbar-status-badge").inner_text()
        record("Header Status Badge", "เปิดรับโปรเจกต์" in badge_text, badge_text)

        cta_btn = page.locator(".topbar-cta-btn").count()
        record("Header CTA Button", cta_btn > 0)

        # Check Business Impact Badges before filtering
        impact_count = page.locator(".business-impact-badge").count()
        record("Business Impact Badges on Cards", impact_count >= 6, f"Found {impact_count} impact badges")

        # Check search input & Enter key
        page.fill("#topbar-search-input", "สต็อก")
        time.sleep(0.3)
        works_count = page.locator(".work-item-card").count()
        record("Search Real-time Filter", works_count >= 1, f"Found {works_count} matching cards")

        # Clear search
        page.click(".clear-search-btn")
        time.sleep(0.2)

        # Check Pricing section
        pricing_cards = page.locator(".pricing-card").count()
        record("Packages & Pricing Grid", pricing_cards == 3, f"Found {pricing_cards} cards")

        # Check Guarantees section
        guarantee_cards = page.locator(".guarantee-card").count()
        record("Trust & SLA Guarantees Grid", guarantee_cards == 6, f"Found {guarantee_cards} cards")

        # Check About Architect section
        architect_sec = page.locator("#about-architect").count()
        record("Lead Architect Profile Section", architect_sec > 0)

        # Check Estimator Form
        print("\n[Test 2: Interactive Estimator Form (#estimator-form)]", flush=True)
        estimator_form = page.locator("#estimator-form").count()
        record("Estimator Form Section Exists", estimator_form > 0)

        # Test calculation updates
        price_before = page.locator("#calc-est-price").inner_text()
        page.click("input[name='est-systems'][value='crm']")
        time.sleep(0.2)
        price_after = page.locator("#calc-est-price").inner_text()
        record("Estimator Live Calculation", price_after != "", f"{price_before} -> {price_after}")

        # Test submit estimator
        page.fill("#est-contact-name", "คุณทดสอบ ระบบ")
        page.fill("#est-contact-tel", "089-999-8888")
        page.click("#btn-submit-estimator")
        time.sleep(0.4)
        modal_title = page.locator(".modal h2").inner_text()
        record("Estimator Submit Modal", "สำเร็จ" in modal_title or "ได้รับข้อมูล" in modal_title, modal_title)
        page.click("[data-close-modal]")
        time.sleep(0.2)

        # 2. E-Signature & Audit Certificate
        print("\n[Test 3: E-Signature & Audit Certificate]", flush=True)
        page.goto(f"{BASE_URL}/e-signature", wait_until="networkidle")
        conversion_bar = page.locator(".demo-conversion-bar").count()
        record("Floating Conversion Bar on /e-signature", conversion_bar > 0)

        # Draw on canvas
        canvas = page.locator("canvas")
        if canvas.count() > 0:
            box = canvas.bounding_box()
            page.mouse.move(box["x"] + 20, box["y"] + 20)
            page.mouse.down()
            page.mouse.move(box["x"] + 100, box["y"] + 80)
            page.mouse.up()
            time.sleep(0.2)

            sign_btn = page.locator("[data-submit-sign]")
            if sign_btn.is_enabled():
                sign_btn.click()
                time.sleep(0.5)

        # Check Audit Certificate modal
        cert_btn = page.locator("[data-view-certificate]")
        if cert_btn.count() > 0:
            cert_btn.click()
            time.sleep(0.3)
            cert_box = page.locator(".audit-certificate-box")
            cert_text = cert_box.inner_text()
            has_thai = "ปรียา" in cert_text or "ไทย" in cert_text or "E-SIGNATURE" in cert_text
            has_tofu = "□" in cert_text
            record("Audit Certificate Thai Text", has_thai and not has_tofu, f"No tofu found. Thai: {has_thai}")
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # Check return to CRM button
        return_btn = page.locator("a[href='/business-suite']")
        record("Return to CRM Button on /e-signature", return_btn.count() > 0)

        # 3. CRM & E-Sign State Sync
        print("\n[Test 4: CRM & E-Sign State Sync]", flush=True)
        page.goto(f"{BASE_URL}/business-suite", wait_until="networkidle")
        page.click("button[data-tab='contract']")
        time.sleep(0.3)
        contract_text = page.locator(".app-shell").inner_text()
        record("CRM Contract Sync Status", "ลงนามสำเร็จ" in contract_text, "Signed status verified")

        # 4. SmartPOS & Receipt Modal
        print("\n[Test 5: SmartPOS & Receipt Modal]", flush=True)
        page.goto(f"{BASE_URL}/pos-system-smart", wait_until="networkidle")
        record("Floating Conversion Bar on /pos-system-smart", page.locator(".demo-conversion-bar").count() > 0)

        # Switch to POS tab first
        page.click("button[data-tab='pos']")
        time.sleep(0.3)

        # Add item and checkout
        page.click("button[data-pos-add-item]")
        time.sleep(0.3)
        if page.locator("#modifier-form").count() > 0:
            page.click("#modifier-form button.btn.primary")
            time.sleep(0.3)
        page.click("button[data-pos-pay='PromptPay QR']")
        time.sleep(0.5)

        receipt = page.locator(".receipt-slip")
        if receipt.count() > 0:
            receipt_text = receipt.inner_text()
            has_thai_labels = "เลขออเดอร์" in receipt_text or "โต๊ะ" in receipt_text or "ขอบคุณ" in receipt_text
            has_tofu = "□" in receipt_text
            record("SmartPOS Receipt Thai Text", has_thai_labels and not has_tofu, f"No tofu found. Text: {receipt_text[:60]}")
            print_btn = page.locator("button:has-text('พิมพ์ใบเสร็จ')")
            record("Thermal 80mm Print Button", print_btn.count() > 0)
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # 5. NexusWMS Export CSV & Labels
        print("\n[Test 6: NexusWMS CSV & Label Preview]", flush=True)
        page.goto(f"{BASE_URL}/warehouse-management", wait_until="networkidle")
        page.click("button[data-tab='inventory']")
        time.sleep(0.3)
        csv_btn = page.locator("[data-wms-export-csv]")
        record("NexusWMS Export CSV Button", csv_btn.count() > 0)

        label_btn = page.locator("[data-wms-label]").first
        if label_btn.count() > 0:
            label_btn.click()
            time.sleep(0.3)
            sticker_box = page.locator(".barcode-sticker-box")
            record("Barcode Label Preview Modal", sticker_box.count() > 0)
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # 6. Thai Shipping Suite LINE Flex & Invoice
        print("\n[Test 7: Thai Shipping Suite LINE Flex & Invoice]", flush=True)
        page.goto(f"{BASE_URL}/usa-thai-shipping/admin", wait_until="networkidle")
        line_btn = page.locator("[data-line]").first
        if line_btn.count() > 0:
            line_btn.click()
            time.sleep(0.3)
            flex_card = page.locator(".line-flex-card")
            record("LINE Flex Message Preview Modal", flex_card.count() > 0)
            page.click("[data-close-modal]")
            time.sleep(0.2)

        invoice_btn = page.locator("[data-invoice]").first
        if invoice_btn.count() > 0:
            invoice_btn.click()
            time.sleep(0.3)
            inv_modal = page.locator(".receipt-slip, .modal")
            record("Commercial Invoice Modal", inv_modal.count() > 0)
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # 7. OAI Storefront Simulated Checkout Flow
        print("\n[Test 8: OAI Storefront Simulated Checkout Flow]", flush=True)
        page.goto(f"{BASE_URL}/ecommerce-storefront", wait_until="networkidle")
        chk_trigger = page.locator("#btn-trigger-checkout")
        record("Storefront Checkout Trigger Button", chk_trigger.count() > 0)
        if chk_trigger.count() > 0:
            chk_trigger.click()
            time.sleep(0.3)
            chk_modal = page.locator("#checkout-flow-container")
            record("Simulated Checkout Modal", chk_modal.count() > 0)

            page.click("#btn-confirm-checkout")
            time.sleep(0.3)
            confirm_text = page.locator("#checkout-flow-container").inner_text()
            record("Order Confirmation Generated", "ORD-2026-" in confirm_text, confirm_text[:60])
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # 8. Tilt Signal Venue Reservation & Admin Desk
        print("\n[Test 9: Tilt Signal Reservation & Admin Desk]", flush=True)
        page.goto(f"{BASE_URL}/tilt-signal-arcade-bar", wait_until="networkidle")
        book_btn = page.locator("#btn-tilt-open-book")
        record("Tilt Signal Table Booking Button", book_btn.count() > 0)

        if book_btn.count() > 0:
            book_btn.click()
            time.sleep(0.3)
            page.click("#btn-tilt-submit-book")
            time.sleep(0.3)
            ticket_box = page.locator(".tilt-booking-ticket")
            record("Neon QR Ticket Pass Generated", ticket_box.count() > 0)
            page.click("[data-close-modal]")
            time.sleep(0.2)

        # Switch to Admin Reservation Desk
        admin_tab = page.locator("[data-tilt-tab='admin']")
        if admin_tab.count() > 0:
            admin_tab.click()
            time.sleep(0.3)
            table_rows = page.locator("table tbody tr").count()
            record("Admin Reservation Desk Table", table_rows >= 1, f"Found {table_rows} reservations")

        # 9. Direct URL Refresh on all 6 routes (HTTP 200)
        print("\n[Test 10: Direct URL Refresh & Routing]", flush=True)
        routes = [
            "/warehouse-management",
            "/business-suite",
            "/e-signature",
            "/pos-system-smart",
            "/usa-thai-shipping",
            "/ecommerce-storefront",
            "/tilt-signal-arcade-bar"
        ]
        all_routes_ok = True
        for r in routes:
            resp = page.goto(f"{BASE_URL}{r}", wait_until="domcontentloaded")
            if resp.status != 200:
                all_routes_ok = False
                print(f"Route {r} returned {resp.status}", flush=True)
        record("Direct URL Refresh on All 6 Demos", all_routes_ok)

        # 10. Mobile Responsiveness (No horizontal overflow)
        print("\n[Test 11: Mobile Responsiveness]", flush=True)
        mobile_context = browser.new_context(viewport={'width': 375, 'height': 812})
        mobile_page = mobile_context.new_page()
        mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(0.5)

        is_overflow = mobile_page.evaluate("""() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        }""")
        record("Mobile Viewport Horizontal Overflow Check", not is_overflow, f"Overflow: {is_overflow}")

        mobile_page.screenshot(path="C:/Users/rpump/.gemini/antigravity/brain/2f05618e-31ae-4fad-a82a-e8ce65fbee26/verify_mobile_final.png")
        page.screenshot(path="C:/Users/rpump/.gemini/antigravity/brain/2f05618e-31ae-4fad-a82a-e8ce65fbee26/verify_desktop_final.png")

        browser.close()

    print("\n================== SUMMARY ==================", flush=True)
    print(f"Total Passed: {len(passed)}", flush=True)
    print(f"Total Failed: {len(failed)}", flush=True)
    if failed:
        print("Failed tests:", failed, flush=True)
        sys.exit(1)
    else:
        print("ALL QA CHECKLIST ITEMS PASSED 100%!", flush=True)

if __name__ == "__main__":
    run_tests()
