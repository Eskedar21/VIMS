# Admin Portal Color Palette Update

## New Color Palette

The admin portal has been updated to use the following color scheme:

- **Primary Green**: `#88bf47` - Used for primary buttons, links, and primary actions
- **Accent Green**: `#0fa84a` - Used for hover states and secondary green elements
- **Secondary Blue**: `#1d8dcc` - Available for secondary actions and accents

## Changes Made

### 1. Tailwind Configuration
Updated `tailwind.config.js` to include the new color palette:
- `primary.DEFAULT`: `#88bf47`
- `primary.dark`: `#0fa84a`
- `primary.hover`: `#6fa038`
- `secondary.DEFAULT`: `#1d8dcc`
- `secondary.dark`: `#1570a0`
- `secondary.hover`: `#1a7bb3`
- `accent.DEFAULT`: `#0fa84a`
- `accent.dark`: `#0d8a3d`

### 2. Color Replacements
All instances of the old colors have been replaced:
- `#005f40` → `#88bf47` (primary green)
- `#004d33` → `#0fa84a` (accent green)
- `#009639` → `#88bf47` (primary green)
- `#007A2F` → `#0fa84a` (accent green)

### 3. Files Updated
The following components and pages have been updated:
- All inspection-related pages
- All center management pages
- All configuration pages
- All security pages
- All governance pages
- All fee/payment pages
- All casework pages
- All system administration pages
- All components (MapPicker, Drawers, etc.)

## Usage Examples

### Primary Buttons
```jsx
<button className="bg-[#88bf47] text-white hover:bg-[#0fa84a]">
  Primary Action
</button>
```

### Focus States
```jsx
<input className="focus:ring-2 focus:ring-[#88bf47]" />
```

### Links
```jsx
<a className="text-[#88bf47] hover:text-[#0fa84a]">
  Link Text
</a>
```

### Using Tailwind Classes (Recommended)
```jsx
<button className="bg-primary text-white hover:bg-primary-dark">
  Primary Action
</button>
```

## Verification

✅ All old color codes have been replaced
✅ Build completes successfully
✅ No linter errors
✅ Color palette is consistent across all pages

## Next Steps

You can now use the new color palette throughout the admin portal. The colors are available as:
- Inline hex codes: `#88bf47`, `#0fa84a`, `#1d8dcc`
- Tailwind classes: `primary`, `primary-dark`, `secondary`, `accent`

