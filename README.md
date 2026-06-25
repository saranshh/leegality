# 🛒 Leegality Product Catalog Application

An Amazon-style Product Listing and Detail Page web application built with React, React Router, and Vanilla CSS. It dynamically fetches and filters product data from the DummyJSON API.

## 🚀 Setup & Execution Instructions

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed.

### 2. Installation
Clone/extract the code and run the following command in the project root folder to install dependencies:
```bash
npm install
```

### 3. Running Dev Server
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the application.

### 4. Building for Production
To compile and optimize the app for production:
```bash
npm run build
```
This outputs production-ready assets inside the `dist/` directory.

---

## 📌 Architectural Decisions

1. **URL Search Parameter State Sync**:
   All filters (categories checklist, min/max price, selected brands checklist, and search query) and the current pagination page are synchronized with the browser's URL search parameters (using React Router's `useSearchParams`).
   - **Benefit**: Restores filters when navigating back from the detail page (natively supported via browser history or the back button), and allows bookmarking/sharing filtered views.

2. **Smart Dynamic Combined Filtering**:
   - The application dynamically fetches all products using `GET /products?limit=0` once, allowing instantaneous client-side combined filtering & pagination.
   - Brands are extracted dynamically *only* from the active categories dataset, preventing showing brands that have 0 products in the selected categories.
   - Changing filters resets the active page to page 1 immediately.

3. **Vanilla CSS Styling (Modern Dual Amazon Layout)**:
   - Customized CSS variables are utilized for light/dark mode compatibility.
   - Designed a dual navbar header matching the modern Amazon website layout (featuring curved arrow branding logo, Delivering Location, search bar, language, and cart icon).
   - Designed responsive sidebar checkbox checklists, price inputs with an "Apply" button, card grids with clean hover transition transforms, and pagination.

---

## 💡 Assumptions Made

1. **Combined Filtering**:
   Since dynamic category fetching (`/products/category/{category}`) doesn't support combined server-side query filters for brand list or price ranges natively, we fetch all category products using `limit=0` and perform efficient client-side combined filtering & pagination on the results. This provides a lightning-fast responsive interface.
2. **Back Button**:
   Using `navigate(-1)` returns the user to the previous URL search parameter state, satisfying the requirement to keep all filters applied.
3. **Image Gallery**:
   We combine the `thumbnail` and secondary `images` fields in the database for each product, ensuring that the primary image is always included in the image gallery thumbnails listing.

---

## 🔮 Improvements If Given More Time

1. **Debounce Search Inputs**: Add a debounce delay to the sidebar search bar to prevent rapid successive filter recalculations while typing.
2. **Skeleton Loaders**: Implement elegant skeleton outlines loaders instead of a spinning wheel.
3. **Persisted Favorites/Cart**: Add local storage based shopping cart and wishlist toggles on product cards.
