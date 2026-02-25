# Specification

## Summary
**Goal:** Fix two regressions introduced in Version 117 — the Products page not displaying products and the admin login not working.

**Planned changes:**
- Fix the ProductGrid component to correctly fetch products from the backend and render them in the filterable, paginated grid with proper loading and error states.
- Fix the AdminLogin component so both username/password and Internet Identity authentication flows complete successfully, persist session state, and grant access to the Admin Panel.
- Ensure logout correctly clears the session and failed login attempts show appropriate error messages.

**User-visible outcome:** The Products page displays products with working filters and pagination, and admins can log in via either authentication method to access the Admin Panel.
