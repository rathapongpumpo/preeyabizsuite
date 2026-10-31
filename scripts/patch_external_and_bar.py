# -*- coding: utf-8 -*-
with open('public/assets/app.js', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_external = """  function renderExternal(kind) {
    const source = kind === 'ecommerce'
      ? 'https://ecommerce-codex-demo.vercel.app/'
      : kind === 'medical'
        ? 'https://medical-flow-lovat.vercel.app/'
        : 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
    const frameTitle = kind === 'ecommerce' ? 'OAI Apparel Storefront' : kind === 'medical' ? 'Medical Flow Clinic' : 'Tilt Signal Arcade Bar';
    app.innerHTML = `<iframe class="external-frame" src="${source}" title="${frameTitle}"></iframe>`;
  }"""

new_external_and_utilities = """  // Priority 3.5: Storefront Simulated Checkout Flow Modal
  function openStorefrontCheckoutModal() {
    modal('จำลองขั้นตอนสั่งซื้อสินค้า (Simulated Checkout Flow)', `
      <div id="checkout-flow-container">
        <!-- Step 1: Shipping Address -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px dashed var(--line)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <h4 style="margin:0;font-size:14px;font-weight:700">1. ข้อมูลจัดส่ง (Shipping Address)</h4>
            <button class="btn small outline" type="button" id="btn-checkout-autofill">⚡ กรอกข้อมูลตัวอย่างอัตโนมัติ</button>
          </div>
          <div class="grid cols-2" style="gap:10px">
            <input class="input" type="text" id="chk-name" placeholder="ชื่อ-นามสกุล ผู้รับ" value="คุณปรียา สุทธิสาร">
            <input class="input" type="text" id="chk-phone" placeholder="เบอร์โทรศัพท์ติดต่อ" value="081-234-5678">
            <input class="input" type="text" id="chk-addr" style="grid-column:1/-1" placeholder="ที่อยู่จัดส่ง" value="123/45 ซ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110">
          </div>
        </div>

        <!-- Step 2: Payment Method -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px dashed var(--line)">
          <h4 style="margin:0 0 10px;font-size:14px;font-weight:700">2. เลือกวิธีชำระเงิน (Payment Method)</h4>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <label style="border:1px solid var(--primary);background:var(--primary-light);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="qr" checked>
              <div style="font-size:12px;font-weight:bold;margin-top:4px">PromptPay QR</div>
            </label>
            <label style="border:1px solid var(--line);background:var(--panel);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="card">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">บัตรเครดิต</div>
            </label>
            <label style="border:1px solid var(--line);background:var(--panel);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="cod">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">เก็บเงินปลายทาง</div>
            </label>
          </div>
        </div>

        <!-- Step 3: Order Summary & Confirm -->
        <div style="background:var(--subtle);padding:14px;border-radius:10px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:bold;margin-bottom:8px">สรุปรายการคำสั่งซื้อ</div>
          <div style="font-size:12.5px;line-height:1.6">
            <div style="display:flex;justify-content:space-between"><span>1 × OAI Classic Heavyweight Hoodie (L)</span><strong>1,290 ฿</strong></div>
            <div style="display:flex;justify-content:space-between"><span>2 × OAI Signature Cotton T-Shirt (M)</span><strong>1,180 ฿</strong></div>
            <div style="display:flex;justify-content:space-between;color:var(--green)"><span>ค่าจัดส่ง Standard Delivery</span><strong>ฟรี</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:bold;border-top:1px dashed var(--line);padding-top:6px;margin-top:6px">
              <span>ยอดชำระสุทธิ:</span><span style="color:var(--primary)">2,470 ฿</span>
            </div>
          </div>
        </div>

        <button class="btn primary" type="button" id="btn-confirm-checkout" style="width:100%;padding:12px;font-size:14px;font-weight:700">
          🛍️ ยืนยันคำสั่งซื้อ (จำลองการชำระเงิน)
        </button>
      </div>
    `);

    document.getElementById('btn-checkout-autofill')?.addEventListener('click', () => {
      document.getElementById('chk-name').value = 'คุณปรียา สุทธิสาร';
      document.getElementById('chk-phone').value = '081-234-5678';
      document.getElementById('chk-addr').value = '123/45 ซ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110';
      toast('กรอกข้อมูลที่อยู่ตัวอย่างเรียบร้อย');
    });

    document.getElementById('btn-confirm-checkout')?.addEventListener('click', () => {
      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const container = document.getElementById('checkout-flow-container');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:16px 8px">
            <div style="font-size:48px;margin-bottom:8px">🎉</div>
            <h3 style="font-size:20px;font-weight:800;color:var(--green);margin:0 0 6px">การสั่งซื้อจำลองสำเร็จ!</h3>
            <p style="color:var(--muted);font-size:13px;margin:0 0 16px">ระบบบันทึกออเดอร์และตัดสต็อกจำลองเรียบร้อยแล้ว</p>
            
            <div style="background:var(--subtle);border-radius:10px;padding:16px;text-align:left;font-size:13px;line-height:1.7;margin-bottom:16px">
              <div><strong>หมายเลขคำสั่งซื้อ:</strong> <span style="color:var(--primary);font-weight:bold">${orderId}</span></div>
              <div><strong>ผู้รับสินค้า:</strong> คุณปรียา สุทธิสาร (081-234-5678)</div>
              <div><strong>ยอดชำระ:</strong> 2,470 บาท (PromptPay QR ชำระแล้ว)</div>
              <div><strong>สถานะจัดส่ง:</strong> <span class="badge success">กำลังเตรียมพัสดุ</span></div>
              <div><strong>กำหนดส่ง:</strong> ภายใน 2–3 วันทำการ (Flash Express)</div>
            </div>

            <button class="btn primary" type="button" onclick="document.querySelector('.modal-overlay')?.remove()">
              กลับสู่หน้าร้านค้า
            </button>
          </div>
        `;
      }
    });
  }

  // Priority 3.6: Tilt Signal Table Booking Modal
  function openTiltBookingModal(onSuccess) {
    modal('จองโต๊ะและรับคิวออนไลน์ (Interactive Table Booking)', `
      <form id="tilt-booking-form">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:12.5px;font-weight:bold;margin-bottom:6px">1. เลือกโซนที่นั่ง (Seat Zone)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <label style="border:1px solid #00F0FF;background:rgba(0,240,255,0.08);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="Arcade Zone" checked>
              <div style="font-size:12px;font-weight:bold;margin-top:4px">Arcade Zone</div>
              <small class="muted">โซนเกมตู้ & แสงสี</small>
            </label>
            <label style="border:1px solid var(--line);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="Neon Booth">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">Neon Booth</div>
              <small class="muted">โซนบูธนีออนส่วนตัว</small>
            </label>
            <label style="border:1px solid var(--line);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="VIP Lounge">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">VIP Lounge</div>
              <small class="muted">ห้องวีไอพีกลุ่มใหญ่</small>
            </label>
          </div>
        </div>

        <div class="grid cols-2" style="gap:12px;margin-bottom:14px">
          <div class="field">
            <label>2. รอบเวลาจอง</label>
            <select class="select" id="tilt-time">
              <option value="18:30 น.">18:30 น. (หัวค่ำ)</option>
              <option value="19:30 น." selected>19:30 น. (ช่วงพีค)</option>
              <option value="21:00 น.">21:00 น. (ดนตรีสด)</option>
              <option value="22:30 น.">22:30 น. (Late Night)</option>
            </select>
          </div>
          <div class="field">
            <label>จำนวนลูกค้า</label>
            <select class="select" id="tilt-guests">
              <option value="2">2 ท่าน</option>
              <option value="4" selected>4 ท่าน</option>
              <option value="6">6 ท่าน</option>
              <option value="8">8+ ท่าน (กลุ่มใหญ่)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <label style="font-size:12.5px;font-weight:bold">3. ข้อมูลผู้จอง</label>
            <button class="btn small outline" type="button" id="btn-tilt-autofill">⚡ ตัวอย่าง</button>
          </div>
          <div class="grid cols-2" style="gap:10px">
            <input class="input" type="text" id="tilt-cust-name" placeholder="ชื่อ-นามสกุล" value="คุณปรียา สุทธิสาร" required>
            <input class="input" type="text" id="tilt-cust-phone" placeholder="เบอร์โทรศัพท์" value="081-234-5678" required>
          </div>
        </div>

        <button class="btn primary" type="button" id="btn-tilt-submit-book" style="width:100%;padding:12px;font-weight:700;background:#00F0FF;color:#000;border:none">
          🍸 ยืนยันการจองโต๊ะ (รับ QR Ticket Pass)
        </button>
      </form>
    `);

    document.getElementById('btn-tilt-autofill')?.addEventListener('click', () => {
      document.getElementById('tilt-cust-name').value = 'คุณปรียา สุทธิสาร';
      document.getElementById('tilt-cust-phone').value = '081-234-5678';
      toast('กรอกข้อมูลตัวอย่างเรียบร้อย');
    });

    document.getElementById('btn-tilt-submit-book')?.addEventListener('click', () => {
      const name = document.getElementById('tilt-cust-name')?.value.trim() || 'ลูกค้า';
      const phone = document.getElementById('tilt-cust-phone')?.value.trim() || '081-000-0000';
      const zone = document.querySelector('input[name="tilt-zone"]:checked')?.value || 'Arcade Zone';
      const time = document.getElementById('tilt-time')?.value || '19:30 น.';
      const guests = Number(document.getElementById('tilt-guests')?.value || 4);
      const resId = `TILT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRes = {
        id: resId,
        name,
        phone,
        zone,
        date: today(),
        time,
        guests,
        status: 'confirmed'
      };

      let list = [];
      try { list = JSON.parse(localStorage.getItem('tilt_signal_reservations') || '[]'); } catch(e){}
      list.unshift(newRes);
      try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(list)); } catch(e){}

      // Show Neon Ticket Pass
      modal('บัตรจองโต๊ะดิจิทัล (Tilt Signal Digital Ticket)', `
        <div class="tilt-booking-ticket">
          <div style="font-size:11px;letter-spacing:2px;color:#00F0FF;text-transform:uppercase;margin-bottom:6px">
            TILT SIGNAL · VENUE & ARCADE BAR
          </div>
          <h2 style="margin:0 0 4px;font-size:24px;color:#fff">${esc(zone)}</h2>
          <div style="font-size:13px;color:#A0AEC0;margin-bottom:14px">รอบเวลา ${esc(time)} · ${guests} ท่าน</div>

          <div style="background:#fff;padding:12px;border-radius:8px;display:inline-block;margin-bottom:12px">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="#000">
              <rect x="0" y="0" width="30" height="30"/>
              <rect x="70" y="0" width="30" height="30"/>
              <rect x="0" y="70" width="30" height="30"/>
              <rect x="35" y="10" width="10" height="10"/>
              <rect x="15" y="35" width="20" height="20"/>
              <rect x="45" y="45" width="20" height="20"/>
              <rect x="70" y="35" width="15" height="15"/>
              <rect x="35" y="75" width="15" height="15"/>
              <rect x="75" y="75" width="15" height="15"/>
            </svg>
          </div>

          <div style="font-family:monospace;font-size:16px;font-weight:bold;color:#00F0FF;letter-spacing:2px;margin-bottom:10px">
            ${resId}
          </div>

          <div style="font-size:12.5px;color:#E2E8F0;border-top:1px dashed #2D3748;padding-top:10px;text-align:left;line-height:1.6">
            <div><strong>ผู้จอง:</strong> ${esc(name)} (${esc(phone)})</div>
            <div><strong>สถานะ:</strong> <span style="color:#00F0FF">✅ ยืนยันการจองแล้ว</span></div>
            <div><strong>โต๊ะ:</strong> Reserved at Host Station</div>
          </div>
          <p style="margin:12px 0 0;font-size:11px;color:#718096">กรุณาแสดง QR Code นี้ให้พนักงานหน้าร้านเมื่อมาถึง</p>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ พิมพ์บัตรจอง Pass</button></div>`);

      if (typeof onSuccess === 'function') onSuccess();
    });
  }

  function renderExternal(kind) {
    if (kind === 'ecommerce') {
      const source = 'https://ecommerce-codex-demo.vercel.app/';
      app.innerHTML = `
        <div class="storefront-native-bar">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge primary" style="font-size:11px">LIVE STOREFRONT DEMO</span>
            <span style="font-size:13.5px;font-weight:700">OAI Apparel · Next.js Modern Storefront</span>
          </div>
          <button class="btn small primary" id="btn-trigger-checkout" type="button">🛒 ตะกร้าสินค้า & สั่งซื้อ (Simulated Checkout) →</button>
        </div>
        <iframe class="external-frame" src="${source}" title="OAI Apparel Storefront" style="height:calc(100vh - 105px)"></iframe>
      `;

      app.querySelector('#btn-trigger-checkout')?.addEventListener('click', () => {
        openStorefrontCheckoutModal();
      });
      return;
    }

    if (kind === 'tilt') {
      const source = 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
      let tiltActiveTab = 'storefront';

      function renderTiltSuite() {
        const defaultReservations = [
          { id: 'TILT-2026-8812', name: 'คุณปรียา สุทธิสาร', phone: '081-234-5678', zone: 'Neon Booth', date: today(), time: '19:30 น.', guests: 4, status: 'confirmed' },
          { id: 'TILT-2026-8813', name: 'คุณธนภัทร วงศ์สว่าง', phone: '089-876-5432', zone: 'VIP Lounge', date: today(), time: '21:00 น.', guests: 8, status: 'seated' },
          { id: 'TILT-2026-8814', name: 'คุณณัฐพงศ์ สุขใจ', phone: '082-345-6789', zone: 'Arcade Zone', date: today(), time: '20:00 น.', guests: 2, status: 'confirmed' }
        ];

        let reservations = [];
        try {
          reservations = JSON.parse(localStorage.getItem('tilt_signal_reservations') || 'null');
        } catch(e) {}
        if (!Array.isArray(reservations) || !reservations.length) {
          reservations = defaultReservations;
          try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
        }

        if (tiltActiveTab === 'storefront') {
          app.innerHTML = `
            <div class="tilt-switch-bar">
              <div class="tilt-switch-tabs">
                <button class="tilt-tab-btn active" type="button" data-tilt-tab="storefront">🌐 มุมมองหน้าเว็บลูกค้า (Customer Storefront)</button>
                <button class="tilt-tab-btn" type="button" data-tilt-tab="admin">📋 มุมมองหลังบ้านจัดการคิวจอง (Admin Reservation Desk) [${reservations.length}]</button>
              </div>
              <button class="btn small primary" id="btn-tilt-open-book" type="button" style="background:#00F0FF;color:#000;font-weight:800;border:none">📅 จองโต๊ะ / จองคิวออนไลน์ (Reserve Table)</button>
            </div>
            <iframe class="external-frame" src="${source}" title="Tilt Signal Arcade Bar" style="height:calc(100vh - 105px)"></iframe>
          `;
        } else {
          app.innerHTML = `
            <div class="tilt-switch-bar">
              <div class="tilt-switch-tabs">
                <button class="tilt-tab-btn" type="button" data-tilt-tab="storefront">🌐 มุมมองหน้าเว็บลูกค้า (Customer Storefront)</button>
                <button class="tilt-tab-btn active" type="button" data-tilt-tab="admin">📋 มุมมองหลังบ้านจัดการคิวจอง (Admin Reservation Desk) [${reservations.length}]</button>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn small" id="btn-tilt-add-sample" type="button">+ เพิ่มการจองตัวอย่าง</button>
                <button class="btn small danger" id="btn-tilt-reset" type="button">รีเซ็ตข้อมูลคิว</button>
              </div>
            </div>
            <div class="page-pad">
              <div class="grid cols-4" style="margin-bottom:16px">
                <article class="card stat-card"><small>รายการจองทั้งหมด</small><strong>${reservations.length} รายการ</strong><small>วันนี้และล่วงหน้า</small></article>
                <article class="card stat-card"><small>ยืนยันแล้ว (Confirmed)</small><strong style="color:var(--green)">${reservations.filter(x => x.status === 'confirmed').length} โต๊ะ</strong><small>รอเข้าใช้บริการ</small></article>
                <article class="card stat-card"><small>ลูกค้าเข้าโต๊ะแล้ว (Seated)</small><strong style="color:var(--primary)">${reservations.filter(x => x.status === 'seated').length} โต๊ะ</strong><small>กำลังให้บริการ</small></article>
                <article class="card stat-card"><small>ยกเลิก (Cancelled)</small><strong style="color:var(--coral)">${reservations.filter(x => x.status === 'cancelled').length} โต๊ะ</strong><small>สละสิทธิ์</small></article>
              </div>

              <section class="card">
                <div class="card-head">
                  <div>
                    <p class="eyebrow" style="color:#00F0FF">Tilt Signal Back-Office</p>
                    <h2>ตารางจัดการคิวและโต๊ะจอง (Venue Reservation Queue)</h2>
                  </div>
                </div>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>รหัสการจอง</th>
                        <th>ลูกค้า & เบอร์ติดต่อ</th>
                        <th>โซนที่นั่ง</th>
                        <th>รอบเวลา</th>
                        <th>จำนวน</th>
                        <th>สถานะ</th>
                        <th>จัดการสถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${reservations.map(r => `
                        <tr>
                          <td><code>${esc(r.id)}</code></td>
                          <td><strong>${esc(r.name)}</strong><br><small class="muted">${esc(r.phone)}</small></td>
                          <td><span class="chip" style="font-weight:700">${esc(r.zone)}</span></td>
                          <td><strong>${esc(r.time)}</strong><br><small class="muted">${esc(r.date)}</small></td>
                          <td><strong>${r.guests} ท่าน</strong></td>
                          <td>
                            ${r.status === 'confirmed' ? '<span class="badge success">✅ ยืนยันแล้ว</span>' : r.status === 'seated' ? '<span class="badge primary">🍸 เข้าโต๊ะแล้ว</span>' : '<span class="badge danger">✕ ยกเลิก</span>'}
                          </td>
                          <td>
                            <div style="display:flex;gap:4px">
                              <button class="btn small" data-tilt-status="${r.id}" data-val="confirmed" title="ยืนยัน">ยืนยัน</button>
                              <button class="btn small primary" data-tilt-status="${r.id}" data-val="seated" title="เข้าโต๊ะ">เข้าโต๊ะ</button>
                              <button class="btn small danger" data-tilt-status="${r.id}" data-val="cancelled" title="ยกเลิก">✕</button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          `;
        }

        app.querySelectorAll('[data-tilt-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            tiltActiveTab = btn.dataset.tiltTab;
            renderTiltSuite();
          });
        });

        app.querySelector('#btn-tilt-open-book')?.addEventListener('click', () => {
          openTiltBookingModal(() => {
            renderTiltSuite();
          });
        });

        app.querySelectorAll('[data-tilt-status]').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetId = btn.dataset.tiltStatus;
            const newVal = btn.dataset.val;
            const r = reservations.find(x => x.id === targetId);
            if (r) {
              r.status = newVal;
              try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
              renderTiltSuite();
              toast('อัปเดตสถานะการจองเรียบร้อย');
            }
          });
        });

        app.querySelector('#btn-tilt-add-sample')?.addEventListener('click', () => {
          const sample = {
            id: `TILT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'คุณสมชาย สายปาร์ตี้',
            phone: '085-111-2233',
            zone: 'Neon Booth',
            date: today(),
            time: '20:30 น.',
            guests: 4,
            status: 'confirmed'
          };
          reservations.unshift(sample);
          try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
          renderTiltSuite();
          toast('เพิ่มตัวอย่างการจองเรียบร้อย');
        });

        app.querySelector('#btn-tilt-reset')?.addEventListener('click', () => {
          if (confirm('คืนค่ารายการจองเริ่มต้นทั้งหมด?')) {
            try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(defaultReservations)); } catch(e){}
            renderTiltSuite();
            toast('คืนค่าข้อมูลเริ่มต้นเรียบร้อย');
          }
        });
      }

      renderTiltSuite();
      return;
    }

    const source = kind === 'medical'
      ? 'https://medical-flow-lovat.vercel.app/'
      : 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
    const frameTitle = kind === 'medical' ? 'Medical Flow Clinic' : 'External Showcase';
    app.innerHTML = `<iframe class="external-frame" src="${source}" title="${frameTitle}"></iframe>`;
  }

  // Priority 2.1: Floating Conversion Bar (<DemoConversionBar />)
  function renderConversionBar(currentPath) {
    const existing = document.querySelector('.demo-conversion-bar');
    if (existing) existing.remove();

    const configs = {
      '/warehouse-management': {
        interest: 'wms',
        title: 'สนใจระบบคลังสินค้าแบบ NexusWMS?',
        sub: 'ปรับแต่งให้เข้ากับคลังและบาร์โค้ดธุรกิจคุณ พร้อมใช้งานใน 3–4 สัปดาห์'
      },
      '/business-suite': {
        interest: 'crm',
        title: 'ต้องการระบบ CRM & เซ็นสัญญาออนไลน์?',
        sub: 'เชื่อมต่อทีมขาย ใบเสนอราคา และลายเซ็นดิจิทัลครบวงจรในที่เดียว'
      },
      '/e-signature': {
        interest: 'crm',
        title: 'ต้องการระบบ CRM & เซ็นสัญญาออนไลน์?',
        sub: 'เชื่อมต่อทีมขาย ใบเสนอราคา และลายเซ็นดิจิทัลครบวงจรในที่เดียว'
      },
      '/pos-system-smart': {
        interest: 'pos',
        title: 'สนใจระบบหน้าร้าน POS & จอครัว KDS?',
        sub: 'รองรับทั้งร้านอาหาร คาเฟ่ และหลายสาขา ปรับแก้ตามเมนูร้านได้ 100%'
      },
      '/usa-thai-shipping': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/usa-thai-shipping/admin': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/usa-thai-shipping/customer': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/ecommerce-storefront': {
        interest: 'storefront',
        title: 'อยากมีเว็บขายของออนไลน์แบรนด์ตัวเอง?',
        sub: 'เว็บโหลดไว รองรับตะกร้าสินค้า ชำระเงินอัตโนมัติ และจัดการสต็อกหลังบ้าน'
      },
      '/tilt-signal-arcade-bar': {
        interest: 'storefront',
        title: 'ต้องการเว็บหน้าร้านพร้อมระบบจองคิว/จองโต๊ะ?',
        sub: 'ดีไซน์โดดเด่นตามเอกลักษณ์แบรนด์ พร้อมระบบรับจองและจัดการคิวหลังบ้าน'
      }
    };

    const c = configs[currentPath] || configs['/warehouse-management'];
    const bar = document.createElement('aside');
    bar.className = 'demo-conversion-bar';
    bar.setAttribute('aria-label', 'แถบติดต่อและขอใบเสนอราคา');
    bar.innerHTML = `
      <div class="conversion-bar-header">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px">💼</span>
          <h4 class="conversion-bar-title">${c.title}</h4>
        </div>
        <button class="conversion-bar-toggle" type="button" title="ย่อ/ขยายแถบ" aria-label="ย่อแถบ">_</button>
      </div>
      <div class="conversion-bar-body">
        <p class="conversion-bar-subtext">${c.sub}</p>
      </div>
      <div class="conversion-bar-actions">
        <a class="btn primary small" href="/#estimator-form?interest=${c.interest}">ขอใบเสนอราคาระบบนี้</a>
        <a class="btn outline small" href="https://line.me/R/ti/p/@486fpcll" target="_blank" rel="noreferrer" style="border-color:#06C755;color:#06C755">ทัก LINE ปรึกษาด่วน ↗</a>
      </div>
    `;

    document.body.appendChild(bar);

    const toggleBtn = bar.querySelector('.conversion-bar-toggle');
    toggleBtn.addEventListener('click', () => {
      bar.classList.toggle('minimized');
      toggleBtn.textContent = bar.classList.contains('minimized') ? '◻' : '_';
      toggleBtn.setAttribute('aria-label', bar.classList.contains('minimized') ? 'ขยายแถบ' : 'ย่อแถบ');
    });
  }

  // Priority 1.4: Loading Skeleton helper
  function showLoadingSkeleton(callback) {
    let skeleton = document.getElementById('demo-loading-skeleton');
    if (!skeleton) {
      skeleton = document.createElement('div');
      skeleton.id = 'demo-loading-skeleton';
      skeleton.className = 'demo-loading-skeleton';
      skeleton.innerHTML = `
        <div class="demo-skeleton-spinner"></div>
        <div class="demo-skeleton-text">กำลังโหลดสภาพแวดล้อมระบบจำลอง...</div>
        <div class="demo-skeleton-shimmer">
          <div class="demo-skeleton-bar" style="width:100%"></div>
          <div class="demo-skeleton-bar" style="width:75%"></div>
          <div class="demo-skeleton-bar" style="width:90%"></div>
        </div>
      `;
      document.body.appendChild(skeleton);
    }
    skeleton.classList.remove('hidden');
    setTimeout(() => {
      callback();
      setTimeout(() => {
        skeleton.classList.add('hidden');
      }, 100);
    }, 150);
  }"""

code = code.replace(old_external, new_external_and_utilities)

# Update handler execution at the bottom of app.js
old_dispatch = """  if (app && handlers[page]) handlers[page]();"""
new_dispatch = """  if (app && handlers[page]) {
    handlers[page]();
    if (page !== 'portal') {
      renderConversionBar(pathname);
    } else {
      // Check for ?interest= query param on home
      const qParams = new URLSearchParams(window.location.search);
      const interestParam = qParams.get('interest');
      if (interestParam) {
        setTimeout(() => {
          const formEl = document.getElementById('estimator-form');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          const chk = document.querySelector(`input[name="est-systems"][value="${interestParam}"]`);
          if (chk) {
            chk.checked = true;
            chk.dispatchEvent(new Event('change'));
          }
        }, 300);
      }
    }
  }"""

code = code.replace(old_dispatch, new_dispatch)

with open('public/assets/app.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print("External demos (Checkout & Tilt Signal) and Conversion Bar patched successfully")
