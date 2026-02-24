# Specification

## Summary
**Goal:** Allow any authenticated user to add products, removing the admin-only restriction.

**Planned changes:**
- Modify backend authorization to permit product uploads from any authenticated user (custom auth or Internet Identity)
- Update frontend ProductManagement component to remove client-side admin checks blocking authenticated users

**User-visible outcome:** Any logged-in user can successfully upload products without encountering authorization errors.
