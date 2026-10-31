# -*- coding: utf-8 -*-
with open('public/assets/app.js', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

# 1. Add Export CSV button to Inventory toolbar in WMS
old_inv_toolbar = """            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input class="input" id="wms-search" style="max-width:260px" placeholder="ค้นหา SKU, ชื่อ หรือ Zone..." value="${esc(s.data.search)}">
              <button class="btn small yellow" data-wms-scanner>📷 สแกนเนอร์</button>
              <button class="btn primary small" data-wms-add-sku>+ เพิ่ม SKU ใหม่</button>
            </div>"""

new_inv_toolbar = """            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input class="input" id="wms-search" style="max-width:260px" placeholder="ค้นหา SKU, ชื่อ หรือ Zone..." value="${esc(s.data.search)}">
              <button class="btn small outline" data-wms-export-csv title="ส่งออกรายงานสต็อกเป็นไฟล์ CSV">📥 ส่งออกรายงานสต็อก (Export CSV)</button>
              <button class="btn small yellow" data-wms-scanner>📷 สแกนเนอร์</button>
              <button class="btn primary small" data-wms-add-sku>+ เพิ่ม SKU ใหม่</button>
            </div>"""
code = code.replace(old_inv_toolbar, new_inv_toolbar)

# 2. Add Label Preview button to Inventory rows in WMS
old_inv_row_actions = """                        <button class="btn small primary" data-wms-po="${x.sku}" title="สั่งซื้อด่วน">PO</button>
                        <button class="btn small" data-wms-transfer-item="${x.sku}" title="ย้ายโซน">ย้าย</button>"""

new_inv_row_actions = """                        <button class="btn small outline" data-wms-label="${x.sku}" title="พิมพ์สติกเกอร์บาร์โค้ด">🏷️ สติกเกอร์</button>
                        <button class="btn small primary" data-wms-po="${x.sku}" title="สั่งซื้อด่วน">PO</button>
                        <button class="btn small" data-wms-transfer-item="${x.sku}" title="ย้ายโซน">ย้าย</button>"""
code = code.replace(old_inv_row_actions, new_inv_row_actions)

# 3. Add Export CSV to Stock Ledger & Reports view in WMS
old_reports_head = """          <div class="card-head">
            <div>
              <p class="eyebrow" style="color:var(--blue)">Inventory Audit Trail</p>
              <h2>ประวัติการรับเข้า-เบิกจ่ายสินค้า (Stock Movement Ledger)</h2>
            </div>
            <button class="btn small" data-wms-clear-logs>ล้างประวัติ Log</button>
          </div>"""

new_reports_head = """          <div class="card-head">
            <div>
              <p class="eyebrow" style="color:var(--blue)">Inventory Audit Trail</p>
              <h2>ประวัติการรับเข้า-เบิกจ่ายสินค้า (Stock Movement Ledger)</h2>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn small outline" data-wms-export-csv>📥 ส่งออกรายงานสต็อก (Export CSV)</button>
              <button class="btn small" data-wms-clear-logs>ล้างประวัติ Log</button>
            </div>
          </div>"""
code = code.replace(old_reports_head, new_reports_head)

# 4. Bind Export CSV and Label Preview in WMS
old_wms_clear_logs = """    // Clear logs
    app.querySelector('[data-wms-clear-logs]')?.addEventListener('click', () => {
      if (confirm('ต้องการล้างประวัติ Stock Movement ทั้งหมด?')) { s.data.logs = []; save(); toast('ล้างประวัติเรียบร้อย'); }
    });"""

new_wms_handlers = """    // Clear logs
    app.querySelector('[data-wms-clear-logs]')?.addEventListener('click', () => {
      if (confirm('ต้องการล้างประวัติ Stock Movement ทั้งหมด?')) { s.data.logs = []; save(); toast('ล้างประวัติเรียบร้อย'); }
    });

    // Priority 3.1: Export Stock Report CSV (with UTF-8 BOM)
    app.querySelectorAll('[data-wms-export-csv]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bom = '\\uFEFF';
        const headers = ['รหัส SKU', 'ชื่อสินค้า', 'หมวดหมู่', 'ซัพพลายเออร์', 'จำนวนคงเหลือ (ชิ้น)', 'จุดสั่งซื้อซ้ำ (Min Stock)', 'ราคาต่อหน่วย (บาท)', 'มูลค่ารวม (บาท)', 'ตำแหน่งจัดเก็บ'];
        const rows = s.data.inventory.map(item => [
          `"${item.sku}"`,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.category}"`,
          `"${(item.supplier || '-').replace(/"/g, '""')}"`,
          item.stock,
          item.minStock,
          item.price,
          item.stock * item.price,
          `"${item.location}"`
        ].join(','));
        const csvContent = bom + [headers.join(','), ...rows].join('\\r\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `nexuswms-inventory-report-${Date.now()}.csv`;
        link.click();
        toast('ดาวน์โหลดรายงานสต็อก CSV เรียบร้อยแล้ว (เปิดใน Excel ได้ทันที)');
      });
    });

    // Priority 3.1: Barcode & QR Label Preview Modal
    app.querySelectorAll('[data-wms-label]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = s.data.inventory.find(x => x.sku === btn.dataset.wmsLabel);
        if (!item) return;
        modal('ตัวอย่างป้ายสติกเกอร์บาร์โค้ดติดกล่อง (Label Sticker Preview)', `
          <div class="barcode-sticker-box">
            <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#555;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:8px">
              NEXUS WMS · WAREHOUSE LOGISTICS
            </div>
            <h3 style="margin:4px 0 2px;font-size:18px;color:#111">${esc(item.name)}</h3>
            <div style="font-size:12px;color:#666">SKU: <strong>${esc(item.sku)}</strong> · Category: ${esc(item.category)}</div>
            
            <div class="barcode-lines-sim"></div>
            <div style="font-family:monospace;font-size:13px;font-weight:bold;letter-spacing:4px;margin-bottom:10px">*${esc(item.sku)}*</div>

            <div style="display:flex;justify-content:space-around;background:#f5f5f5;padding:8px;border-radius:6px;font-size:12px;margin-top:10px">
              <div><strong>ตำแหน่ง (Zone):</strong><br><span style="font-size:14px;color:var(--primary)">${esc(item.location)}</span></div>
              <div><strong>หน่วยบรรจุ:</strong><br><span style="font-size:14px">กล่อง / ชิ้น</span></div>
              <div><strong>จุดตรวจนับ:</strong><br><span style="font-size:14px">IN-OK</span></div>
            </div>
            <p style="margin:12px 0 0;font-size:11px;color:#888">สำหรับเครื่องพิมพ์สติกเกอร์ความร้อน (Thermal Label 100×75mm)</p>
          </div>
        `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ สั่งพิมพ์สติกเกอร์ (Print Label)</button></div>`);
      });
    });"""
code = code.replace(old_wms_clear_logs, new_wms_handlers)

# 5. Upgrade Shipping LINE Flex preview and Commercial Invoice
old_shipping_line = """    // LINE Notification Modal
    app.querySelectorAll('[data-line]').forEach((el) => el.addEventListener('click', () => {
      const list = s.data.packages.filter(x => x.customer === el.dataset.line);
      const text = `[Preeya Shipping Notify]
เรียนคุณ ${el.dataset.line}
พัสดุนำเข้าจาก USA รวม ${list.length} รายการ:

${list.map(x => `📦 ${x.tracking} (${x.method})
สถานะ: ${shippingStatuses[x.status]}
ยอดชำระ: ${money((x.shippingFee || 0) + (x.duty || 0))}`).join('\\n---\\n')}

ตรวจสอบรายละเอียดเพิ่มเติมได้ที่: https://preeyabizsuite.vercel.app/usa-thai-shipping/customer`;
      modal('ข้อความแจ้งเตือนผ่าน LINE Notify (ตัวอย่าง)', `<textarea class="textarea" style="min-height:180px;font-family:'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace">${esc(text)}</textarea><p class="muted">สามารถคัดลอกข้อความนี้ส่งเข้า LINE ของลูกค้าได้ทันที</p>`);
    }));"""

new_shipping_line = """    // Priority 3.4: Simulated LINE Flex Message Mobile Preview Modal
    app.querySelectorAll('[data-line]').forEach((el) => el.addEventListener('click', () => {
      const list = s.data.packages.filter(x => x.customer === el.dataset.line);
      const primaryPkg = list[0] || {};
      const totalDue = list.reduce((a, x) => a + Number(x.shippingFee || 0) + Number(x.duty || 0), 0);
      const textRaw = `[Preeya Shipping Notify]\\nเรียนคุณ ${el.dataset.line}\\nพัสดุนำเข้าจาก USA รวม ${list.length} รายการ:\\n` +
        list.map(x => `📦 ${x.tracking} (${x.method})\\nสถานะ: ${shippingStatuses[x.status]}\\nยอดชำระ: ${money((x.shippingFee || 0) + (x.duty || 0))}`).join('\\n---\\n') +
        `\\n\\nตรวจสอบได้ที่: https://preeyabizsuite.vercel.app/usa-thai-shipping/customer`;

      modal('จำลองการแจ้งเตือนลูกค้าทาง LINE (LINE Flex Message Preview)', `
        <div class="line-phone-frame">
          <div class="line-chat-screen">
            <div style="font-size:11px;color:#fff;text-align:center;margin-bottom:8px;opacity:0.85">วันนี้ 14:32 น.</div>
            <div class="line-flex-card">
              <div class="line-flex-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.97 1.7 5.59 4.34 7.15-.19.68-.69 2.47-.79 2.85-.13.48.18.47.37.35.16-.1 2.2-1.46 3.09-2.06.64.1 1.3.15 1.99.15 5.52 0 10-3.92 10-8.75S17.52 2 12 2z"/></svg>
                <span>Thai Shipping Logistics · Official</span>
              </div>
              <div class="line-flex-body">
                <div style="font-size:14px;font-weight:bold;margin-bottom:4px;color:#111">แจ้งเตือนสถานะพัสดุนำเข้า USA → TH</div>
                <div style="font-size:12px;color:#555;margin-bottom:10px">เรียนคุณ <strong>${esc(el.dataset.line)}</strong></div>
                <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:8px 10px;border-radius:6px;margin-bottom:10px">
                  <span style="font-size:11px;color:#166534;font-weight:bold">สถานะล่าสุด:</span>
                  <div style="font-size:13px;font-weight:bold;color:#15803D">${shippingStatuses[primaryPkg.status || 0]}</div>
                </div>
                <div style="font-size:12px;line-height:1.6;border-bottom:1px dashed #ddd;padding-bottom:8px;margin-bottom:8px">
                  <div><strong>เลข Tracking:</strong> ${esc(primaryPkg.tracking || 'TH-USA-9921')}</div>
                  <div><strong>รูปแบบขนส่ง:</strong> ${esc(primaryPkg.method || 'Air Freight')}</div>
                  <div><strong>น้ำหนัก / CBM:</strong> ${primaryPkg.weight || 0} kg (${primaryPkg.cbm || 0} CBM)</div>
                  <div><strong>จำนวนพัสดุ:</strong> ${list.length} รายการ</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:12px;font-weight:bold">ยอดชำระสุทธิ:</span>
                  <span style="font-size:16px;font-weight:bold;color:#06C755">${money(totalDue)}</span>
                </div>
              </div>
              <div class="line-flex-actions">
                <a class="line-flex-btn" href="/usa-thai-shipping/customer?query=${esc(el.dataset.line)}" target="_blank">📦 ตรวจสอบ Timeline พัสดุ</a>
                <button class="line-flex-btn secondary" type="button" onclick="alert('จำลองการส่งข้อมูล PromptPay ให้ลูกค้าชำระเงินเรียบร้อย')">💳 ดู QR Code ชำระค่านำเข้า</button>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top:14px;text-align:center">
          <button class="btn small" onclick="navigator.clipboard.writeText('${esc(textRaw).replace(/'/g, "\\\\'")}');toast('คัดลอกข้อความ LINE Notify สำเร็จ!')">📋 คัดลอกข้อความดิบ (Raw Message)</button>
        </div>
      `);
    }));"""
code = code.replace(old_shipping_line, new_shipping_line)

with open('public/assets/app.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print("NexusWMS CSV/Labels and Shipping LINE Flex patched successfully")
