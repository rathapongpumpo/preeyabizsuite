# -*- coding: utf-8 -*-
import re

with open('public/assets/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Normalize line endings
code = code.replace('\r\n', '\n')

print("Original app.js length:", len(code))

# 1. Update font-family: monospace in SmartPOS receipt, Audit certificate, and Shipping LINE Notify
code = code.replace(
    'style="background:#fff;color:#111;padding:20px;border-radius:12px;font-family:monospace;max-width:360px;margin:auto"',
    'style="background:#fff;color:#111;padding:20px;border-radius:12px;font-family:\'JetBrains Mono\', \'IBM Plex Sans Thai\', \'Sarabun\', monospace;max-width:360px;margin:auto"'
)

code = code.replace(
    'style="padding:16px;background:var(--subtle);border-radius:10px;font-family:monospace;font-size:13px;line-height:1.8"',
    'class="audit-certificate-box" style="padding:16px;background:var(--subtle);border-radius:10px;font-family:\'JetBrains Mono\', \'IBM Plex Sans Thai\', \'Sarabun\', monospace;font-size:13px;line-height:1.8"'
)

code = code.replace(
    'style="min-height:180px;font-family:monospace"',
    'style="min-height:180px;font-family:\'JetBrains Mono\', \'IBM Plex Sans Thai\', \'Sarabun\', monospace"'
)

# 2. Update SmartPOS receipt labels and thermal 80mm button
old_smartpos_receipt = """          <div style="text-align:center;border-bottom:1px dashed #333;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:20px">Preeya Cafe & Bistro</h2>
            <p style="margin:4px 0;font-size:12px">TAX ID: 0-1055-69001-99-1</p>
            <p style="margin:0;font-size:12px">บิลเลขที่: ${orderId} · โต๊ะ: ${s.data.selectedTable}</p>
            <p style="margin:0;font-size:11px">${today()} ${newOrder.at}</p>
          </div>"""

new_smartpos_receipt = """          <div style="text-align:center;border-bottom:1px dashed #333;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:20px">Preeya Cafe & Bistro</h2>
            <p style="margin:4px 0;font-size:12px">TAX ID: 0-1055-69001-99-1</p>
            <p style="margin:0;font-size:12px">เลขออเดอร์: ${orderId} · โต๊ะ: ${s.data.selectedTable}</p>
            <p style="margin:0;font-size:11px">วันที่: ${today()} ${newOrder.at}</p>
          </div>"""
code = code.replace(old_smartpos_receipt, new_smartpos_receipt)

code = code.replace(
    '<span>Subtotal:</span><span>${money(cartSubtotal)}</span>',
    '<span>ยอดรวม (Subtotal):</span><span>${money(cartSubtotal)}</span>'
)
code = code.replace(
    '<span>VAT 7%:</span><span>${money(cartVat)}</span>',
    '<span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span><span>${money(cartVat)}</span>'
)
code = code.replace(
    '<span>TOTAL:</span><span>${money(cartTotal)}</span>',
    '<span>ยอดสุทธิ (TOTAL):</span><span>${money(cartTotal)}</span>'
)
code = code.replace(
    '🖨️ พิมพ์ใบเสร็จสลิป',
    '🖨️ พิมพ์ใบเสร็จ (Thermal 80mm Preview)'
)

# 3. Update E-Sign state saving to preeya_esign_status & Return to CRM button
old_esign_success = """          s.data.audit[s.data.selectedDoc] = {
            docHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
            signerName: s.data.signerName,
            signerRole: s.data.signerRole,
            companyName: s.data.companyName,
            time: new Date().toLocaleString('th-TH'),
            ip: '182.52.198.42',
            location: 'Bangkok, Thailand'
          };
          save();
          toast('ลงนามในเอกสารสัญญาเรียบร้อยแล้ว');"""

new_esign_success = """          const auditLog = {
            docHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
            signerName: s.data.signerName,
            signerRole: s.data.signerRole,
            companyName: s.data.companyName,
            time: new Date().toLocaleString('th-TH'),
            ip: '182.52.198.42',
            location: 'Bangkok, Thailand'
          };
          s.data.audit[s.data.selectedDoc] = auditLog;
          try {
            localStorage.setItem('preeya_esign_status', JSON.stringify({
              signed: true,
              signerName: s.data.signerName,
              signerRole: s.data.signerRole,
              companyName: s.data.companyName,
              signedAt: auditLog.time,
              docId: s.data.selectedDoc,
              docTitle: currentDoc.title
            }));
          } catch(e){}
          save();
          toast('ลงนามในเอกสารสัญญาเรียบร้อยแล้ว');"""
code = code.replace(old_esign_success, new_esign_success)

# Add return-to-crm button in esign when signed
old_esign_actions = """        <div class="form-actions" style="margin-top:16px">
          <button class="btn" data-download-pdf>📥 ดาวน์โหลดสัญญาพร้อมลายเซ็น (PDF)</button>
          <button class="btn" data-view-certificate>📜 ดูใบรับรอง Audit Certificate</button>
        </div>"""

new_esign_actions = """        <div class="form-actions" style="margin-top:16px;flex-wrap:wrap">
          <a class="btn primary" href="/business-suite">← กลับไปดูสถานะในระบบ CRM</a>
          <button class="btn" data-download-pdf>📥 ดาวน์โหลดสัญญาพร้อมลายเซ็น (PDF)</button>
          <button class="btn" data-view-certificate>📜 ดูใบรับรอง Audit Certificate</button>
        </div>"""
code = code.replace(old_esign_actions, new_esign_actions)

# 4. Update CRM contract tab to check preeya_esign_status
old_crm_contract_notice = """        <div class="notice" style="margin-top:20px;border-left:4px solid var(--blue);background:var(--cream-subtle)">
          <strong>✍️ ฟีเจอร์ประกอบ: การส่งต่อลงนามสัญญา (Lite E-Signature)</strong>
          <p style="margin:4px 0 6px;font-size:13px">เมื่อใบเสนอราคาได้รับอนุมัติ สามารถส่งต่อไปยังระบบลงนามเอกสาร Lite E-Signature เพื่อให้ลูกค้าลงนามสัญญาออนไลน์ พร้อมประทับตราและออก Audit Trail Certificate</p>
          <small class="muted">ℹ️ หมายเหตุ: การเชื่อมต่อนี้เป็นการจำลองขั้นตอนทำงาน (Workflow Navigation Handoff) ข้อมูลและสถานะการเซ็นสัญญาไม่ได้ซิงก์กันแบบอัตโนมัติ</small>
        </div>"""

new_crm_contract_notice = """        ${(() => {
          let esign = null;
          try { esign = JSON.parse(localStorage.getItem('preeya_esign_status') || 'null'); } catch(e){}
          if (esign && esign.signed) {
            return `
              <div class="notice" style="margin-top:20px;border-left:4px solid var(--green);background:var(--green-light);color:#065F46">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <strong>✅ ลงนามสำเร็จ (Signed) · ${esc(esign.signedAt)}</strong>
                  <span class="badge success" style="font-size:11px">SHA-256 Cryptographically Sealed</span>
                </div>
                <p style="margin:6px 0 8px;font-size:13px">ผู้ลงนาม: <strong>${esc(esign.signerName)}</strong> (${esc(esign.signerRole || 'Managing Director')}) — ${esc(esign.companyName || d.company)}</p>
                <div style="display:flex;gap:8px">
                  <button class="btn small" data-view-crm-audit type="button">📜 ดูบันทึกลายเซ็นและ Audit Trail</button>
                  <a class="btn small primary" href="/e-signature?from=crm">เปิดดูหน้า E-Signature ↗</a>
                </div>
              </div>
            `;
          }
          return `
            <div class="notice" style="margin-top:20px;border-left:4px solid var(--blue);background:var(--cream-subtle)">
              <strong>✍️ ฟีเจอร์ประกอบ: การส่งต่อลงนามสัญญา (Lite E-Signature)</strong>
              <p style="margin:4px 0 6px;font-size:13px">เมื่อใบเสนอราคาได้รับอนุมัติ สามารถส่งต่อไปยังระบบลงนามเอกสาร Lite E-Signature เพื่อให้ลูกค้าลงนามสัญญาออนไลน์ พร้อมประทับตราและออก Audit Trail Certificate</p>
              <small class="muted">ℹ️ เมื่อลงนามในระบบ E-Sign เรียบร้อย สถานะสัญญาจะซิงก์กลับมาเป็น "ลงนามสำเร็จ" อัตโนมัติ</small>
            </div>
          `;
        })()}"""
code = code.replace(old_crm_contract_notice, new_crm_contract_notice)

# Bind crm audit modal
old_crm_bindings = """    app.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => { s.data.view=el.dataset.tab; saveRender(); }));"""
new_crm_bindings = """    app.querySelector('[data-view-crm-audit]')?.addEventListener('click', () => {
      let esign = null;
      try { esign = JSON.parse(localStorage.getItem('preeya_esign_status') || 'null'); } catch(e){}
      modal('Audit Certificate — Sales Flow CRM & E-Sign', `
        <div class="audit-certificate-box" style="padding:16px;background:var(--subtle);border-radius:10px;font-family:'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace;font-size:13px;line-height:1.8">
          <h3 style="margin:0 0 10px;color:var(--brand)">📜 E-SIGNATURE AUDIT TRAIL LOG</h3>
          <div><strong>Contract Status:</strong> <span class="badge success">ลงนามสำเร็จ (Signed)</span></div>
          <div><strong>Signer Name:</strong> ${esc(esign?.signerName || 'ปรียา สุทธิสาร')} (${esc(esign?.signerRole || 'Managing Director')})</div>
          <div><strong>Organization:</strong> ${esc(esign?.companyName || 'บริษัท เอสเอ็มอี เทค โซลูชั่นส์ จำกัด')}</div>
          <div><strong>Signed Timestamp:</strong> ${esc(esign?.signedAt || today())}</div>
          <div><strong>Document ID:</strong> ${esc(esign?.docId || 'AGR-2026-0881')}</div>
          <div><strong>SHA-256 Checksum:</strong><br><span style="color:var(--success)">sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span></div>
        </div>
      `);
    });
    app.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => { s.data.view=el.dataset.tab; saveRender(); }));"""
code = code.replace(old_crm_bindings, new_crm_bindings)

with open('public/assets/app.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print("SmartPOS, E-Sign, and CRM state sync patched successfully")
