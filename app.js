/* Rapti Nursery – site content (footer, home/about images, services, gallery).
   Needs shop.js loaded first (it holds your Firebase config). */
const Store = {
  async list(col) {
    if (db) { const s = await db.collection(col).get(); return s.docs.map(d => ({id: d.id, ...d.data()})); }
    const r = localStorage.getItem("rapti_" + col);
    return r ? JSON.parse(r) : (col === "plants" ? SEED : []);
  },
  async get(col, id) {
    if (db) { const d = await db.collection(col).doc(id).get(); return d.exists ? {id, ...d.data()} : null; }
    return (await this.list(col)).find(x => x.id === id) || null;
  },
  async put(col, id, data) {
    data = {...data}; delete data.id;
    if (db) { if (id) { await db.collection(col).doc(id).set(data); return id; } return (await db.collection(col).add(data)).id; }
    const l = await this.list(col); id = id || col[0] + Date.now() + Math.random().toString(36).slice(2, 5);
    const row = {...data, id}, i = l.findIndex(x => x.id === id); if (i >= 0) l[i] = row; else l.push(row);
    localStorage.setItem("rapti_" + col, JSON.stringify(l)); return id;
  },
  async del(col, id) {
    if (db) return db.collection(col).doc(id).delete();
    localStorage.setItem("rapti_" + col, JSON.stringify((await this.list(col)).filter(x => x.id !== id)));
  }
};
const INFO_DEFAULT = {
  tagline: "Premium plants and bespoke decoration services. Let's grow together.",
  regName: "", pan: "", regNo: "", address: "F015, Tulsipur-6, Dang, Nepal",
  mapLink: "https://maps.app.goo.gl/2Xxr26ZovwLnqXrb7", phone1: "9857820985", phone2: "9847831731",
  whatsapp: "9857820985", email: "roshan.ach98@gmail.com", hours: "",
  facebook: "https://www.facebook.com/people/Rapti-Nursery-Banaspati-Uddhan/100057600589616/",
  instagram: "https://www.instagram.com/rapti_nursery/", tiktok: "https://www.tiktok.com/@raptinursery", youtube: "",
  heroTitle: "", heroText: ""
};
let _info;
const getInfo = () => _info || (_info = Store.get("site", "info").then(d => ({...INFO_DEFAULT, ...(d || {})})).catch(() => INFO_DEFAULT));
const digits = s => (s || "").replace(/\D/g, "");
const ph = '<div class="noimg"><i class="fas fa-leaf"></i></div>';

async function renderFooter() {
  const f = document.querySelector("footer"); if (!f) return;
  const i = await getInfo(), wa = digits(i.whatsapp);
  if (wa) CFG.whatsapp = wa.length === 10 ? "977" + wa : wa;
  const soc = [["facebook","facebook-f"],["instagram","instagram"],["tiktok","tiktok"],["youtube","youtube"]]
    .filter(([k]) => i[k]).map(([k, ic]) => `<a href="${esc(i[k])}" target="_blank" rel="noopener" aria-label="${k}"><i class="fab fa-${ic}"></i></a>`).join("");
  const biz = [["Registered Business Name", i.regName], ["PAN/VAT Number", i.pan], ["Registration Number", i.regNo], ["Address", i.address],
    ["Contact", [i.phone1, i.phone2].filter(Boolean).join(" / ")], ["Email", i.email], ["Opening Hours", i.hours]]
    .filter(([, v]) => v).map(([l, v]) => `<div><span>${l}</span><b>${esc(v)}</b></div>`).join("");
  f.id = "site-footer";
  f.innerHTML = `<div class="f-in"><div class="f-top">
    <div class="f-brand"><a href="index.html" class="f-logo">Rapti Nursery</a><p>${esc(i.tagline)}</p><div class="f-social">${soc}</div></div>
    <div><h4>Quick Links</h4><a href="index.html">Home</a><a href="products.html">Products</a><a href="services.html">Decoration Services</a><a href="gallery.html">Gallery</a></div>
    <div><h4>Support</h4><a href="cart.html">My Cart</a><a href="reviews.html">Customer Reviews</a>${wa ? `<a href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener">Order on WhatsApp</a>` : ""}${i.phone1 ? `<a href="tel:+977${digits(i.phone1)}">Call ${esc(i.phone1)}</a>` : ""}</div>
    <div><h4>Company</h4><a href="about.html">About Us</a>${i.mapLink ? `<a href="${esc(i.mapLink)}" target="_blank" rel="noopener">Visit Us on Google Maps</a>` : ""}</div></div>
    ${biz ? `<div class="f-biz">${biz}</div>` : ""}
    <div class="f-bot">© ${new Date().getFullYear()} Rapti Nursery. All rights reserved.</div></div>`;
  if (wa) document.body.insertAdjacentHTML("beforeend", `<a class="wa-float" href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>`);
}
async function hydrate() {
  const i = await getInfo(), hero = document.querySelector("[data-hero]");
  if (hero) {
    if (i.heroTitle) hero.querySelector("h1").textContent = i.heroTitle;
    if (i.heroText) hero.querySelector("p").textContent = i.heroText;
    const d = await Store.get("site", "hero"); if (d && d.image) hero.style.backgroundImage = `url("${d.image}")`;
  }
  const ab = document.querySelector("img.about-image");
  if (ab) { const d = await Store.get("site", "about"); if (d && d.image) ab.src = d.image; }
  const sg = document.getElementById("services-grid");
  if (sg) {
    const l = (await Store.list("services")).sort((a, b) => (a.ts || 0) - (b.ts || 0));
    sg.innerHTML = l.length ? l.map(s => `<div class="service-card">${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy">` : ph}<h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>`).join("") : "<p>Services coming soon.</p>";
  }
  const gg = document.getElementById("gallery-grid");
  if (gg) {
    const l = (await Store.list("gallery")).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    gg.innerHTML = l.length ? l.map(g => `<img src="${esc(g.image)}" alt="Rapti Nursery gallery" loading="lazy">`).join("") : "<p>Photos coming soon.</p>";
  }
}
renderFooter().catch(console.error); hydrate().catch(console.error);
