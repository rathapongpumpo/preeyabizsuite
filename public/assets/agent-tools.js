// Public, read-only tools. The generator embeds the same catalog used by MCP.
(() => {
  'use strict';
  const context = document.modelContext ?? navigator.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  const catalog = {"site":{"brand":"BUZLIKE SYSTEMS","descriptor":"เว็บไซต์และระบบสำหรับธุรกิจ","email":"support@buzlike.com","origin":"https://buzlike.com","shareImage":"/assets/portfolio/share-buzlike-v3.png","line":"https://line.me/R/ti/p/@486fpcll","sameAs":["https://line.me/R/ti/p/@486fpcll"],"developerProfile":"https://github.com/rathapongpumpo"},"products":[{"id":"buzlike-pos","name":"BUZLIKE POS","url":"https://pos.buzlike.com/","status":"private-pilot","description":"ระบบขายหน้าร้านสำหรับคาเฟ่ ร้านอาหาร และร้านค้าปลีก ช่วงนำร่องตามคำเชิญ ลงทะเบียนรอได้ ยังไม่เปิดรับชำระค่าสมาชิก"},{"id":"doctor-lawyer","name":"ดอกเตอร์ลอว์เยอร์","url":"https://lawyer.buzlike.com/","status":"public-trial","description":"ผู้ช่วยกฎหมาย AI สำหรับคำถามเบื้องต้น เปิดให้ทดลองใช้งาน ควรปรึกษาทนายความวิชาชีพประกอบการตัดสินใจ"},{"id":"warehouse","name":"ต้นแบบระบบคลังสินค้า","url":"https://buzlike.com/warehouse-management","status":"prototype","description":"ทดลองยอดคงเหลือ รับเข้า–เบิกออก และประวัติสินค้า ข้อมูลจำลองเก็บในเบราว์เซอร์ รับพัฒนาต่อตามขอบเขตงาน"},{"id":"crm","name":"Sales Flow CRM","url":"https://buzlike.com/business-suite","status":"prototype","description":"ต้นแบบติดตามลูกค้า ใบเสนอราคา และโมดูลสัญญาทางเลือก ข้อมูลจำลองเก็บในเบราว์เซอร์ รับพัฒนาต่อตามขอบเขตงาน"}],"estimate":{"systems":{"wms":"คลังสินค้าและสต็อก","crm":"ลูกค้าและงานขาย","pos":"หน้าร้าน POS และจอครัว","shipping":"ขนส่งและติดตามพัสดุ","storefront":"เว็บไซต์ ร้านค้า และระบบจอง","custom":"ระบบเฉพาะ / เชื่อมข้อมูล"},"models":{"template":"ปรับจากระบบต้นแบบ","scratch":"พัฒนาใหม่เฉพาะธุรกิจ","retainer":"พัฒนาต่อและดูแลรายเดือน"},"budgets":{"discuss":"ยังไม่แน่ใจ ขอคุยรายละเอียดก่อน","under15":"ต่ำกว่า 15,000 บาท","15to30":"15,000–30,000 บาท","30to60":"30,000–60,000 บาท","over60":"มากกว่า 60,000 บาท"},"rates":{"template":[{"count":1,"min":15000,"max":25000,"time":"ประมาณ 2–3 สัปดาห์"},{"count":2,"min":25000,"max":40000,"time":"ประมาณ 3–4 สัปดาห์"},{"count":6,"min":40000,"max":65000,"time":"ประมาณ 4–6 สัปดาห์"}],"scratch":[{"count":2,"min":35000,"max":65000,"time":"ประมาณ 4–8 สัปดาห์"},{"count":6,"min":65000,"max":100000,"plus":true,"time":"ประมาณ 6–10 สัปดาห์"}],"retainer":[{"count":6,"min":5000,"max":12000,"time":"วางแผนรอบงานรายเดือน"}]}},"estimateNote":"ราคาเพื่อวางงบเบื้องต้น ไม่ใช่ใบเสนอราคายืนยัน และไม่ใช่ค่าสมาชิก BUZLIKE POS ขอบเขตและเงื่อนไขจริงต้องตกลงก่อนเริ่มงาน","tools":[{"name":"list_systems","description":"List BUZLIKE products and development services, including pilot/prototype status. Reads public data only.","inputSchema":{"type":"object","properties":{},"additionalProperties":false}},{"name":"estimate_project","description":"Estimate indicative development cost in THB from selected system categories. This is not a confirmed quotation or POS subscription. Does not save or send a request.","inputSchema":{"type":"object","properties":{"systems":{"type":"array","items":{"type":"string","enum":["wms","crm","pos","shipping","storefront","custom"]},"minItems":1,"maxItems":6,"uniqueItems":true},"model":{"type":"string","enum":["template","scratch","retainer"],"default":"template"}},"required":["systems"],"additionalProperties":false}},{"name":"get_contact","description":"Read public BUZLIKE contact channels and links. Does not open a message or contact anyone.","inputSchema":{"type":"object","properties":{},"additionalProperties":false}}],"contact":{"email":"support@buzlike.com","line":"https://line.me/R/ti/p/@486fpcll","url":"https://buzlike.com/contact","quoteForm":"https://buzlike.com/#estimator-form"},"mcp":{"name":"com.buzlike/public-information","version":"1.0.0","protocolVersions":["2025-11-25","2025-06-18","2025-03-26"]}};
  const result = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data });
  function execute(name, input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Arguments must be an object');
    if (name !== 'estimate_project') {
      if (Object.keys(input).length) throw new Error('This tool takes no arguments');
      return name === 'list_systems' ? { systems: catalog.products, services: catalog.estimate.systems } : catalog.contact;
    }
    if (Object.keys(input).some(key => !['systems', 'model'].includes(key))) throw new Error('Unknown argument');
    const systems = input.systems, model = Object.hasOwn(input, 'model') ? input.model : 'template';
    if (!Array.isArray(systems) || !systems.length || systems.length > 6 || new Set(systems).size !== systems.length ||
        systems.some(key => typeof key !== 'string' || !Object.hasOwn(catalog.estimate.systems, key)) ||
        typeof model !== 'string' || !Object.hasOwn(catalog.estimate.models, model)) throw new Error('Invalid systems or model');
    const tier = catalog.estimate.rates[model].find(rate => systems.length <= rate.count);
    return { currency: 'THB', min: tier.min, max: tier.max, plus: !!tier.plus, model,
      unit: model === 'retainer' ? 'month' : 'project', timeline: tier.time,
      systems, estimateOnly: true, note: catalog.estimateNote, pricingUrl: catalog.site.origin + '/pricing' };
  }
  for (const definition of catalog.tools) {
    const tool = { ...definition, annotations: { readOnlyHint: true, consequentialHint: false },
      execute: async (input, options) => {
        options?.signal?.throwIfAborted();
        try { return result(execute(definition.name, input)); }
        catch (error) { return { content: [{ type: 'text', text: error.message }], isError: true }; }
      }
    };
    try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch { /* Unsupported draft: keep the normal page usable. */ }
  }
})();
