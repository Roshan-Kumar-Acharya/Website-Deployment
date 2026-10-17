# Rapti Nursery – hosting & owner guide
Files: index/products/plant/cart/about/... = website · admin.html = owner dashboard · shop.js = settings + logic · shop.css/style.css = look.

## A. One-time backend setup (free Firebase) – stores plants, photos, prices, stock
1. firebase.google.com → Go to console → Add project "rapti-nursery" (turn Analytics off). Use the free Spark plan.
2. Build → Firestore Database → Create database → production mode → location asia-south1 (Mumbai).
3. Build → Authentication → Get started → Sign-in method → Email/Password → Enable. Then Users → Add user: owner's email + a strong password. THIS is the owner's login.
4. Project settings (gear) → General → Your apps → Web icon </> → register → copy the firebaseConfig { ... } block.
5. Open shop.js on GitHub (pencil icon) → replace `firebase: null,` with `firebase: { apiKey:"...", authDomain:"...", projectId:"...", storageBucket:"...", messagingSenderId:"...", appId:"..." },` → also change demoPassword (not used once Firebase is on) → Commit.
6. Firestore → Rules → replace everything with the text below → Publish:
   rules_version = '2';
   service cloud.firestore { match /databases/{db}/documents {
     match /plants/{id} { allow read: if true; allow write: if request.auth != null; } } }
   (Everyone can read plants; only the logged-in owner can change them. The apiKey in shop.js is safe to be public.)
7. Authentication → Settings → Authorized domains → Add raptinursery.com.np and www.raptinursery.com.np (and your *.pages.dev address).

## B. Host free: GitHub + Cloudflare Pages
1. Upload all files in this folder to your GitHub repo (Add file → Upload files, drag all, overwrite). Delete products2.html and vercel.json.
2. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → pick the repo. Framework preset: None. Build command: leave empty. Output directory: / (leave blank). Save and Deploy.
3. Pages project → Custom domains → Set up a domain → raptinursery.com.np and follow the DNS steps (at your .np registrar, point nameservers to Cloudflare or add the CNAME it shows).
4. Every future GitHub commit auto-redeploys in ~1 minute. The owner never needs GitHub: plants are changed from /admin.

## C. Owner guide (give this to the owner)
Open raptinursery.com.np/admin → log in → "Add New Plant" (name, category, price, discount %, stock, short description, care tip, photo from phone) → Save. Use +/- to change stock, pencil to edit, trash to delete. Discount 10 = 10% off, shown on the site automatically. Set stock to 0 = "Out of stock". When a WhatsApp order arrives and is confirmed, reduce the stock with the − button.
Bookmark /admin (it's not linked from the public menu).

## Notes
- Until step A5 the site is in demo mode (data only in your own browser). Test before telling the owner.
- Orders go from customer's cart straight to WhatsApp 9857820985; change the number in shop.js (CFG.whatsapp).
- Photos are shrunk to ~700px and stored inside Firestore (free). Good for hundreds of plants.
