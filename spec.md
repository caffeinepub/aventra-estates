# Specification

## Summary
**Goal:** Replace photo URL text inputs with JPEG file upload inputs throughout the Aventra Estates application, updating both the backend data model and all relevant frontend components.

**Planned changes:**
- Update the backend Property data model to store photos as binary blobs instead of URL strings, and update `createProperty`, `updateProperty`, and `getPropertyById` accordingly
- In PostPropertyPage (Features & Photos step), remove photo URL inputs and add a JPEG file upload input supporting multiple files with thumbnail previews
- In EditPropertyPage, remove photo URL inputs and add a JPEG file upload input, pre-populating existing photo thumbnails and allowing new uploads
- Update PropertyCard, PropertyListingPage, PropertyDetailPage (ImageGallerySlider), and any other photo-rendering components to handle blob/base64 photo data and show a placeholder when no photos exist

**User-visible outcome:** Users can upload JPEG image files directly when posting or editing a property, see thumbnail previews before submitting, and all property listings and detail pages correctly display the uploaded photos.
