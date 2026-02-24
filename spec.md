# Specification

## Summary
**Goal:** Add "For Rent" property listing support throughout the application and update all site-wide contact information to official Aventra Estates details.

**Planned changes:**
- Add a `listingType` field (`sale` | `rent`) to the backend Property data model
- Include a "Listing Type" (Buy / Rent) selector in the Post Property form's Basic Info step
- Make the "Rent" tab on the homepage search bar navigate to the property listing page pre-filtered for rental properties
- Add a "Listing Type" filter (All / For Sale / For Rent) to the property listing page sidebar
- Display a "For Rent" badge on property cards and a "For Rent" label on property detail pages for rental listings
- Update the Footer with official contact numbers (+917020271267, +919535511171), email (aventraestate@gmail.com as a mailto link), and office address (Near Goodluck Apartment, Kondhwa, Pune 411048)
- Set WhatsApp floating/CTA links to use +917020271267 as the default number
- Update any Contact/About section with the same official contact details
- Fall back to official contact numbers and email on agent cards when no agent is assigned

**User-visible outcome:** Users can browse, filter, and post rental properties, and all contact touchpoints across the site display the correct official Aventra Estates information.
