/* ===== Rapti Nursery – shop data layer =====
   Works in DEMO mode (data saved in this browser only) until you paste
   your Firebase config below. Then data is shared with every visitor. */
 const firebaseConfig = {
    apiKey: "AIzaSyBjFbmMvv5giRsFYVstwawH4LUcxfV4Q2o",
    authDomain: "rapti-nursery.firebaseapp.com",
    projectId: "rapti-nursery",
    storageBucket: "rapti-nursery.firebasestorage.app",
    messagingSenderId: "115100069000",
    appId: "1:115100069000:web:257dbc06f5ed9d1787433d"
  };,            // paste your Firebase web config object here 
  whatsapp: "9779857820985", // shop WhatsApp number (country code, no +)
  demoPassword: "rapti1234"   // only used in demo mode
};
const SEED = [
  {id:"p1",name:"Grafted Mango Plant (कलम आम)",category:"Fruit Saplings",price:450,discount:0,stock:15,description:"Healthy, high-yielding grafted mango sapling in nursery polybag. Starts fruiting earlier.",care:"Full sunlight, water moderately",image:""},
  {id:"p2",name:"Grafted Litchi Plant (कलम लिची)",category:"Fruit Saplings",price:550,discount:0,stock:10,description:"Grafted litchi sapling, suited to Terai and mid-hills.",care:"Sunlight, regular watering",image:""},
  {id:"p3",name:"Red/Pink Rose (गुलाबको बिरुवा)",category:"Flowering",price:150,discount:10,stock:25,description:"Fragrant rose plant, blooms through most of the year.",care:"Morning sun, water daily in summer",image:""},
  {id:"p4",name:"Snake Plant (सपाइ प्लान्ट)",category:"Indoor Plants",price:250,discount:0,stock:30,description:"Hardy air-purifying indoor plant.",care:"Low light, water every 2 weeks",image:""}
];
let db = null;
if (CFG.firebase && window.firebase) { firebase.initializeApp(CFG.firebase); db = firebase.firestore(); }

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const finalPrice = p => Math.round(p.price * (1 - (p.discount || 0) / 100));

const Shop = {
  live: !!db,
  async list() {
    if (db) { const s = await db.collection("plants").get(); return s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>a.name.localeCompare(b.name)); }
    let l = JSON.parse(localStorage.getItem("rapti_plants") || "null");
    if (!l) { l = SEED; localStorage.setItem("rapti_plants", JSON.stringify(l)); }
    return l;
  },
  async get(id) { return (await this.list()).find(p => p.id === id); },
  async save(p) {
    if (db) { const {id, ...data} = p; if (id) await db.collection("plants").doc(id).set(data); else await db.collection("plants").add(data); return; }
    const l = await this.list();
    if (p.id) l[l.findIndex(x => x.id === p.id)] = p; else l.push({...p, id: "p" + Date.now()});
    localStorage.setItem("rapti_plants", JSON.stringify(l));
  },
  async remove(id) {
    if (db) return db.collection("plants").doc(id).delete();
    localStorage.setItem("rapti_plants", JSON.stringify((await this.list()).filter(p => p.id !== id)));
  },
  priceHTML(p) {
    return p.discount > 0
      ? `<span class="price">Rs. ${finalPrice(p)}</span> <s class="old">Rs. ${p.price}</s> <span class="off">${p.discount}% off</span>`
      : `<span class="price">Rs. ${p.price}</span>`;
  },
  card(p) {
    const out = p.stock <= 0;
    return `<a class="product-card shop-card" href="plant.html?id=${encodeURIComponent(p.id)}">
      ${p.discount > 0 && !out ? `<span class="ribbon">${p.discount}% OFF</span>` : ""}
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<div class="noimg"><i class="fas fa-leaf"></i></div>`}
      <h3>${esc(p.name)}</h3><p>${this.priceHTML(p)}</p>
      <small class="${out ? "oos" : "ins"}">${out ? "Out of stock" : "In stock"}</small></a>`;
  },
  /* ---- cart (saved in the customer's browser) ---- */
  cart() { try { return JSON.parse(localStorage.getItem("rapti_cart") || "[]"); } catch (e) { return []; } },
  setCart(c) { localStorage.setItem("rapti_cart", JSON.stringify(c)); this.badge(); },
  add(id, qty) { const c = this.cart(), x = c.find(i => i.id === id); if (x) x.qty += qty; else c.push({id, qty}); this.setCart(c); },
  badge() { const n = this.cart().reduce((a, i) => a + i.qty, 0); document.querySelectorAll(".cc").forEach(e => e.textContent = n); },
  /* ---- the WhatsApp order message ---- */
  orderLink(lines, name, place) {
    const fmt = n => n.toLocaleString("en-IN");
    const total = lines.reduce((a, l) => a + finalPrice(l.p) * l.qty, 0);
    const body = lines.map((l, i) => `${i + 1}. ${l.p.name.replace(/\s*\(.*\)\s*$/, "")} × ${l.qty} — Rs. ${fmt(finalPrice(l.p) * l.qty)}`).join("\n");
    const msg = `Namaste Rapti Nursery! 🌱\nI would like to order these plants:\n\n${body}\n\nTotal: Rs. ${fmt(total)}\nCustomer name: ${name}\nDelivery location: ${place}\nPlease confirm availability and delivery charges. Thank you!`;
    return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
};
document.addEventListener("DOMContentLoaded", () => {
  const ul = document.querySelector("nav ul");
  if (ul) ul.insertAdjacentHTML("beforeend", `<li><a href="cart.html"><i class="fas fa-shopping-cart"></i> Cart (<span class="cc">0</span>)</a></li>`);
  Shop.badge();
});
