# Specification

## Summary
**Goal:** Fix product add/edit functionality in the admin panel and apply consistent hot-pink button styling across the entire site.

**Planned changes:**
- Fix the "Add Product" flow in ProductManagement so submitting the form successfully calls the backend `addProduct` mutation, persists the product, and refreshes the list without errors
- Fix the "Edit Product" flow so opening the edit dialog pre-populates all existing fields, submitting calls `updateProduct`, and the list reflects saved changes
- Change all buttons site-wide (public pages: Hero CTAs, ProductGrid, Header, Footer, SocialProof, TrustBadges; and Admin Panel: AdminLogin, AdminPanel, ProductManagement dialogs, tab/action buttons) to use the hot-pink Tailwind color token
- Remove any remaining non-pink primary button styles and ensure hover/focus states follow the pink theme

**User-visible outcome:** Admins can successfully add and edit products from the admin panel without errors. All buttons across the public site and admin panel display in hot-pink with consistent hover states.
