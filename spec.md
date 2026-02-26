# Specification

## Summary
**Goal:** Fix product price decimal formatting and update the "Shop on Amazon" button color to soft pink across all product cards.

**Planned changes:**
- Fix price display in ProductGrid and all other product card/listing components so that integer prices (stored in paise) are divided by 100 and shown with 2 decimal places and the Rupee symbol (e.g., ₹1,399.00)
- Change the background color of every "Shop on Amazon" button to a soft pink shade (e.g., bg-pink-300) with a matching hover state and legible text contrast

**User-visible outcome:** Product prices display correctly with decimals and the Rupee symbol throughout the site, and all "Shop on Amazon" buttons appear in soft pink.
