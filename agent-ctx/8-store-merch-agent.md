---
Task ID: 8
Agent: Store Merch Agent
Task: Build Merch Storefront at /store

Files Created:
1. /src/app/store/layout.tsx — Store layout with navbar (Back to Hub, Merch Store branding, cart badge, auth), main content, footer
2. /src/app/store/page.tsx — Server component: fetches products + featured artists, serializes data
3. /src/app/store/store-page-client.tsx — Client component: hero, featured artists, search/filter/sort, product grid, empty state, revenue transparency
4. /src/app/store/products/[id]/page.tsx — Server component: fetches single product + related products
5. /src/app/store/products/[id]/product-detail-client.tsx — Client component: image gallery, product options, add to cart, buy now, artist card, related products
6. /src/app/store/artist/[id]/page.tsx — Server component: fetches artist profile + their products
7. /src/app/store/artist/[id]/artist-store-client.tsx — Client component: artist header, search/sort, product grid
8. /src/app/api/store/cart/route.ts — POST: add to cart (auth check, validation, upsert, return count)
9. /src/app/api/store/cart/count/route.ts — GET: return cart item count

Build Status: PASSES with zero errors
All routes registered: /store, /store/products/[id], /store/artist/[id], /api/store/cart, /api/store/cart/count
