import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

viewports = [
    (1440, 900, 'desktop_1440'),
    (1200, 800, 'desktop_1200'),
    (1024, 768, 'tablet_1024'),
    (768, 1024, 'tablet_768'),
    (390, 844, 'mobile_390'),
    (375, 667, 'mobile_375')
]

all_passed = True

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h, label in viewports:
        page = browser.new_page(viewport={'width': w, 'height': h})
        page.goto('http://127.0.0.1:8080/')
        page.wait_for_selector('.portal-nav')
        
        nav = page.locator('.portal-nav')
        box = nav.bounding_box()
        
        scroll_w = page.evaluate('() => document.documentElement.scrollWidth')
        client_w = page.evaluate('() => document.documentElement.clientWidth')
        has_overflow = scroll_w > client_w
        
        expected_max_h = 65 if w > 640 else 58
        is_height_ok = box['height'] <= expected_max_h
        
        print(f"Viewport {w}x{h} ({label}):")
        print(f"  Nav height = {box['height']:.1f}px (expected <= {expected_max_h}px) -> {'PASS' if is_height_ok else 'FAIL'}")
        print(f"  Overflow = {has_overflow} (scrollWidth={scroll_w}, clientWidth={client_w}) -> {'PASS' if not has_overflow else 'FAIL'}")
        
        if w <= 992:
            toggle = page.locator('#portal-mobile-toggle')
            menu = page.locator('#portal-mobile-menu')
            if toggle.is_visible():
                toggle.click()
                page.wait_for_timeout(300)
                is_menu_visible = menu.is_visible()
                print(f"  Mobile drawer toggle click -> Menu visible: {is_menu_visible} -> {'PASS' if is_menu_visible else 'FAIL'}")
                page.screenshot(path=f"C:/Users/rpump/.gemini/antigravity/brain/2f05618e-31ae-4fad-a82a-e8ce65fbee26/nav_{label}_drawer.png")
                toggle.click()
                page.wait_for_timeout(200)
        
        page.screenshot(
            path=f"C:/Users/rpump/.gemini/antigravity/brain/2f05618e-31ae-4fad-a82a-e8ce65fbee26/nav_{label}_fixed.png",
            clip={'x': 0, 'y': 0, 'width': w, 'height': min(h, 280)}
        )
        page.close()
        
        if not is_height_ok or has_overflow:
            all_passed = False

    # Test clicking desktop nav links (fresh page per link to test landing position)
    print("\n--- Testing Desktop Navigation Links ---")
    for hash_target in ['#projects', '#pricing', '#guarantees', '#about-architect', '#estimator-form']:
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.goto('http://127.0.0.1:8080/')
        page.wait_for_selector('.portal-nav')
        
        link = page.locator(f'.portal-nav a[href="{hash_target}"]').first
        if link.count() > 0:
            link.click()
            page.wait_for_timeout(1000)
            target_el = page.locator(hash_target)
            target_box = target_el.bounding_box()
            in_view = 0 <= target_box['y'] <= 900
            print(f"Click nav link {hash_target} -> target top y={target_box['y']:.1f}px (in view: {in_view}) -> {'PASS' if in_view else 'FAIL'}")
            if not in_view:
                all_passed = False
        page.close()

    # Test Mobile Drawer Links
    print("\n--- Testing Mobile Drawer Links ---")
    mob_page = browser.new_page(viewport={'width': 390, 'height': 844})
    mob_page.goto('http://127.0.0.1:8080/')
    mob_page.wait_for_selector('.portal-nav')
    
    mob_toggle = mob_page.locator('#portal-mobile-toggle')
    mob_toggle.click()
    mob_page.wait_for_timeout(300)
    
    mob_link = mob_page.locator('.mobile-nav-link[href="#projects"]')
    mob_link.click()
    mob_page.wait_for_timeout(1000)
    
    drawer_closed = not mob_page.locator('#portal-mobile-menu').is_visible()
    projects_box = mob_page.locator('#projects').bounding_box()
    in_view = 0 <= projects_box['y'] <= 844
    print(f"Mobile click #projects -> drawer closed: {drawer_closed}, projects y={projects_box['y']:.1f}px (in view: {in_view}) -> {'PASS' if drawer_closed and in_view else 'FAIL'}")
    if not (drawer_closed and in_view):
        all_passed = False
    mob_page.close()

    # Test Search filtering
    print("\n--- Testing Search Input ---")
    search_page = browser.new_page(viewport={'width': 1440, 'height': 900})
    search_page.goto('http://127.0.0.1:8080/')
    search_page.wait_for_selector('.portal-nav')
    
    initial_cards = search_page.locator('.all-works-grid .work-item-card').count()
    print(f"Initial cards count: {initial_cards} (expected 6) -> {'PASS' if initial_cards == 6 else 'FAIL'}")
    if initial_cards != 6:
        all_passed = False

    search_input = search_page.locator('#topbar-search-input')
    search_input.fill('WMS')
    search_page.wait_for_timeout(500)
    visible_cards = search_page.locator('.all-works-grid .work-item-card').count()
    print(f"Search 'WMS' -> visible cards count: {visible_cards} (expected 1) -> {'PASS' if visible_cards == 1 else 'FAIL'}")
    if visible_cards != 1:
        all_passed = False

    # Clear search
    clear_btn = search_page.locator('.clear-search-btn')
    if clear_btn.is_visible():
        clear_btn.click()
        search_page.wait_for_timeout(500)
        total_cards = search_page.locator('.all-works-grid .work-item-card').count()
        print(f"Clear search -> all cards count: {total_cards} (expected 6) -> {'PASS' if total_cards == 6 else 'FAIL'}")
        if total_cards != 6:
            all_passed = False
    search_page.close()

    browser.close()

if all_passed:
    print("\n==========================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("==========================================")
else:
    print("\nSOME TESTS FAILED!")
    sys.exit(1)
