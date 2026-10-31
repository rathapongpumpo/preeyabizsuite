import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

urls = [
    ('Local Dev Server', 'http://127.0.0.1:8080/'),
    ('Production Vercel', 'https://preeyabizsuite.vercel.app/')
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, url in urls:
        print(f"\n==========================================")
        print(f"Profiling: {name} ({url})")
        print(f"==========================================")
        page = browser.new_page()
        
        requests = []
        page.on("request", lambda r: requests.append(r))
        
        responses = []
        page.on("response", lambda res: responses.append(res))
        
        try:
            t0 = page.evaluate("() => performance.now()")
            resp = page.goto(url, wait_until="networkidle", timeout=30000)
            t_load = page.evaluate("() => performance.now()") - t0
            
            status = resp.status if resp else "N/A"
            print(f"HTTP Status: {status} | Full Network Idle Time: {t_load:.1f} ms")
            
            # Extract Navigation Timing
            perf = page.evaluate("""() => {
                const nav = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');
                return {
                    ttfb: nav.responseStart - nav.requestStart,
                    domInteractive: nav.domInteractive,
                    domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
                    loadEvent: nav.loadEventEnd - nav.startTime,
                    fcp: fcp ? fcp.startTime : null
                };
            }""")
            print(f"TTFB: {perf['ttfb']:.1f} ms")
            print(f"FCP: {perf['fcp']:.1f} ms" if perf['fcp'] else "FCP: N/A")
            print(f"DOMContentLoaded: {perf['domContentLoaded']:.1f} ms")
            print(f"Load Event: {perf['loadEvent']:.1f} ms")
            
            # Asset Breakdown
            print(f"\n--- Requests Breakdown ({len(responses)} total) ---")
            total_bytes = 0
            slow_requests = []
            large_requests = []
            
            res_data = page.evaluate("""() => {
                return performance.getEntriesByType('resource').map(r => ({
                    name: r.name,
                    initiatorType: r.initiatorType,
                    duration: r.duration,
                    transferSize: r.transferSize || 0,
                    encodedBodySize: r.encodedBodySize || 0
                }));
            }""")
            
            # Sort by transferSize descending
            res_data_sorted_size = sorted(res_data, key=lambda x: x['encodedBodySize'], reverse=True)
            res_data_sorted_time = sorted(res_data, key=lambda x: x['duration'], reverse=True)
            
            print("Top 8 Heaviest Resources:")
            for r in res_data_sorted_size[:8]:
                size_kb = r['encodedBodySize'] / 1024
                print(f"  [{r['initiatorType']}] {size_kb:7.1f} KB ({r['duration']:6.1f} ms) : {r['name'][:90]}")
                
            print("\nTop 8 Slowest Resources:")
            for r in res_data_sorted_time[:8]:
                size_kb = r['encodedBodySize'] / 1024
                print(f"  [{r['initiatorType']}] {r['duration']:6.1f} ms ({size_kb:7.1f} KB) : {r['name'][:90]}")
                
        except Exception as e:
            print(f"Error testing {url}: {e}")
        finally:
            page.close()
    browser.close()
