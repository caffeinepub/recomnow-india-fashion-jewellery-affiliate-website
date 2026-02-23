# Specification

## Summary
**Goal:** Fix the admin authorization check that is preventing authenticated admin users from adding products to the system.

**Planned changes:**
- Debug and fix the isAdmin authorization check in backend main.mo addProduct function to correctly validate admin permissions using session tokens
- Add console logging in frontend ProductManagement component to capture and display the session token being sent with addProduct requests
- Add debug logging in backend main.mo to trace the complete authorization flow (caller principal, session lookup, role verification, failure points)
- Verify that the session token is correctly passed from useBackendAuth hook through useQueries addProduct mutation to the backend actor call

**User-visible outcome:** Admin users can successfully add new products without encountering "Unauthorized: Only admins can add products" errors. The authorization check correctly validates their admin permissions.
