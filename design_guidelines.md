# Design Guidelines: Menu Upload Feature - Referencias Locales Provider Profile

## Design Approach

**Selected Approach**: Design System - Utility-Focused
This is a functional application feature requiring clarity, efficiency, and consistent patterns. Drawing inspiration from **Dropbox's upload patterns** and **Linear's information hierarchy** while maintaining Referencias Locales' established brand identity.

**Core Principles**:
- Clarity in upload states and actions
- Immediate visual feedback for user actions
- Professional, trust-building aesthetic
- Seamless integration with existing profile interface

## Typography

**Font Stack**: Inter or System Font Stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)

**Hierarchy**:
- Section Headers: text-xl (20px), font-semibold
- Subsection Labels: text-sm (14px), font-medium, uppercase tracking-wide
- Body Text: text-base (16px), font-normal
- Helper Text: text-sm (14px), font-normal, reduced opacity (60%)
- File Names: text-sm (14px), font-medium
- Action Links: text-sm (14px), font-medium, underline on hover

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-6
- Tight groupings: gap-2 or gap-4

**Container Strategy**:
- Maximum width: max-w-3xl for upload section (optimal for document preview)
- Responsive padding: px-4 md:px-6
- Vertical rhythm: space-y-8 between major sections

## Component Library

### 1. Upload Section Container
**Structure**: Card-based design with subtle elevation
- Border: 1px solid with 10% opacity of blue (#1463D0)
- Border radius: rounded-lg (8px)
- Background: White with very subtle blue tint (bg-blue-50/30)
- Padding: p-8
- Shadow: Minimal drop shadow for depth

### 2. Drag-and-Drop Upload Area (Empty State)
**Visual Treatment**:
- Dashed border: 2px dashed with 30% opacity of blue (#1463D0)
- Border radius: rounded-lg
- Background: Gradient from white to blue-50 (very subtle)
- Padding: py-12 px-8
- Centered content layout with icon, text, and button stacked

**Content Elements**:
- Icon: Document/upload icon (48px, blue #1463D0)
- Primary text: "Arrastra tu menú aquí" - text-lg, font-semibold
- Secondary text: "o haz clic para seleccionar" - text-sm, 60% opacity
- Supported formats: "PDF, JPG, PNG (max 10MB)" - text-xs, 50% opacity
- CTA Button: "Seleccionar Archivo" - orange (#f97316), rounded-md, px-6 py-2.5, font-medium

**Hover State**: Increase border opacity to 50%, background shifts to blue-50

### 3. Active Upload Area (File Preview State)
**Layout**: Two-column grid (lg:grid-cols-2) or single column on mobile

**Left Column - Document Preview**:
- PDF Preview: Embedded preview with border, rounded corners, aspect-ratio-[1/1.4] (standard document)
- Image Preview: Full preview with object-fit cover, rounded-lg
- Fallback: Large document icon with file type badge for unsupported previews
- Border: 1px solid blue with 15% opacity
- Background: White
- Shadow: Subtle shadow for elevation

**Right Column - File Information & Actions**:
- File name display: Truncated with ellipsis, font-medium, text-base
- File size: text-sm, 60% opacity
- Upload date: text-sm, 60% opacity, with calendar icon
- Upload status indicator: "Documento actual" badge - blue background, white text, rounded-full, px-3 py-1

**Action Buttons Group** (space-y-3):
1. Replace Button: Full width, blue (#1463D0) background, white text, rounded-md, py-2.5, font-medium, with upload icon
2. Delete Button: Full width, white background, red-600 border (1px), red-600 text, rounded-md, py-2.5, font-medium, with trash icon

### 4. Upload Progress State
**During Upload**:
- Progress bar: Full width, h-2, rounded-full
- Background: gray-200
- Fill: Blue (#1463D0) gradient animated
- Percentage text: text-sm, font-medium, positioned above bar
- File name: Shown with loading spinner icon
- Cancel button: text-sm, red-600, positioned to right

### 5. Success/Error States
**Success Banner** (after upload):
- Green background (bg-green-50)
- Border: green-500 with 1px
- Padding: p-4
- Icon: Checkmark circle, green-600
- Text: "Menú actualizado correctamente" - font-medium
- Auto-dismiss after 4 seconds

**Error Banner**:
- Red background (bg-red-50)
- Border: red-500 with 1px
- Padding: p-4
- Icon: Alert circle, red-600
- Text: Error message - font-medium
- Retry button: text-sm, red-600, underline

### 6. Helper Elements
**Information Tooltip** (positioned near upload area):
- Icon: Info circle, 16px, blue (#1463D0)
- Tooltip content on hover: White background, shadow-lg, rounded-md, p-3, text-sm
- Content: Best practices for menu documents (clear photos, good lighting, readable text)

**Guidelines Section** (optional, below upload area):
- Accordion or expandable section
- Title: "Consejos para un mejor menú" - text-base, font-medium
- Bullet points with icons
- Subtle background (bg-gray-50), rounded-lg, p-6

### 7. Mobile Adaptations
- Stack columns vertically
- Full-width buttons
- Larger touch targets (min-h-12 for buttons)
- Preview maintains aspect ratio but scales to container
- Simplified file info display (condensed metadata)

## Integration Context
**Position in Provider Profile**: 
- Placed within "Documentos" or "Mi Negocio" tab
- Section header: "Menú del Restaurante" with description
- Clear visual separation from other profile sections (border-t or larger margin)
- Breadcrumb or tab indicator showing current section

**Consistency Elements**:
- Match existing profile card styles (borders, shadows, radius)
- Use same button styling as other profile actions
- Align with profile's overall grid system
- Maintain existing header and navigation patterns

This design creates a professional, trustworthy upload experience that seamlessly integrates with Referencias Locales' existing visual language while providing clear, intuitive functionality for providers managing their menu documents.