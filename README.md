# ARC shop – React + TypeScript + Vite

```bash
npm install
cp .env.example .env   # set your own admin password
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
```

## Shop
- Browse by category chips, sort, search (press `/`), pick colour and size, add to cart (or quick-add from the card)
- Navbar hides on scroll down, shows on scroll up, has a reading-progress line and a mobile menu
- Product popup shows a photo gallery (`gallery` in `src/data/products.ts`)
- Cart drawer with a free-shipping progress bar
- Checkout with **card** (live preview, brand detection, Luhn check, expiry/CVC validation), **PayPal**, **GCash** (mobile-number check) and **cash on delivery**

- **Track order** (navbar, footer, and after checkout): buyers enter their order number + email to see a status timeline (placed, shipped, delivered, or cancelled)
- **Reviews** in the product popup: buyers rate 1-5 stars and write a review. Only people who bought the product can post (order number + email are checked), one review per order per product

## Admin (click "Admin" in the navbar)
Default password: `admin123` (set `VITE_ADMIN_PASSWORD` in `.env`).
- Add, edit and delete products (name, category, price, description, photo upload, colours with several sample photos each, sizes) with a live preview
- View orders and change their status (new / shipped / delivered / cancelled). Buyers see each change on Track order
- Reviews tab: see every review and delete any you don't want shown

## Important: this is a front-end demo
Products, orders and the cart are saved in the browser's localStorage, and the admin password ships inside the
JavaScript bundle. That's fine for trying things out, but for a real shop you need:
1. A backend + database for products and orders, with real admin authentication
2. A payment provider (Stripe, PayPal, etc.). Never handle raw card numbers yourself;
   use the provider's hosted fields / checkout so card data never touches your code.
   The place to wire this in is `pay()` in `src/components/Checkout.tsx`.

## Where things live
- `src/data/products.ts` – starting products (6 ARC caps use the photos in `public/products/`) and categories
- `src/context/` – products, orders, cart state
- `src/components/Checkout.tsx` – payment flow; `src/lib/payment.ts` – validation helpers
- `src/admin/` – admin login, product form, orders panel

## Product photos
Photos live in `public/products/`. A colour can have its own photo (`colors[].image`), so switching colour in the
product popup swaps the picture. Products added in the admin store their photos in the browser instead.
Prices on the starting products are placeholders: change them in the admin or in `src/data/products.ts`.
