# Restaurant QR Ordering System

A modern, minimal, mobile-first web application for restaurant table-side QR ordering with pay-at-counter functionality.

## Features

### Customer Interface (No Login Required)
- 📱 Mobile-first responsive design
- 🎯 Category-based menu navigation
- 🛒 Persistent shopping cart (localStorage)
- ✅ Real-time order placement
- 🌱 Veg/Non-veg indicators
- 💰 Clear pricing display

### Restaurant Dashboard
- 📊 Live order management with status tracking
- 📝 Menu item management with availability toggles
- 🏷️ Category-based organization
- 🔄 Add/edit menu items
- 📱 QR code management for tables
- 🎯 Table-specific menu links

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables)
- **State Management**: React Hooks (useState, useEffect)
- **Data Persistence**: localStorage (cart), mock data (demo)

## Design Principles

✅ Clean, calm, and professional  
✅ Very simple layout (no clutter)  
✅ Mobile-first approach  
✅ Large tap targets (44px minimum)  
✅ Fast loading with minimal dependencies  
✅ Neutral colors (light background, dark text)  
✅ Subtle shadows and rounded corners  
❌ No flashy gradients or animations  
❌ No dark mode toggle  
❌ No unnecessary features  

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
app/
├── dashboard/              # Restaurant dashboard
│   ├── layout.tsx         # Dashboard layout with sidebar
│   ├── page.tsx           # Live orders page
│   ├── menu/
│   │   └── page.tsx       # Menu management
│   └── tables/
│       └── page.tsx       # Tables & QR codes
├── menu/
│   └── [restaurantId]/
│       └── page.tsx       # Customer menu page
├── layout.tsx             # Root layout
├── page.tsx               # Home page
└── globals.css            # Global styles

components/
└── DashboardSidebar.tsx   # Dashboard navigation

lib/
├── types.ts               # TypeScript type definitions
├── mockData.ts            # Mock menu data
└── mockOrders.ts          # Mock orders data
```

## Usage

### Customer Flow

1. Scan QR code at table → Opens menu with table number
2. Browse categories and add items to cart
3. View cart and adjust quantities
4. Place order → Order sent to kitchen
5. Pay at counter after dining

### Restaurant Flow

1. **Live Orders**: View and manage incoming orders
   - New orders appear with "New Order" badge
   - Mark orders as "Preparing" or "Done"
   - View order details, items, and totals

2. **Menu Management**: Configure menu items
   - Browse items by category
   - Toggle item availability
   - Add new items with form modal

3. **Tables**: Manage table QR codes
   - View all configured tables
   - Download QR codes (planned feature)
   - Preview menu for specific tables

## API Routes (Future Implementation)

For production deployment, replace mock data with actual API calls:

```typescript
// Suggested API structure
GET    /api/menu/:restaurantId          # Get menu
POST   /api/orders                       # Create order
GET    /api/orders/:restaurantId        # Get orders
PATCH  /api/orders/:id                  # Update order status
GET    /api/menu-items                  # Get menu items
POST   /api/menu-items                  # Create menu item
PATCH  /api/menu-items/:id              # Update menu item
DELETE /api/menu-items/:id              # Delete menu item
```

## Customization

### Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --color-accent: #2563eb;        /* Primary brand color */
  --color-bg: #ffffff;            /* Background */
  --color-text: #1a1a1a;          /* Text color */
  /* ... more variables */
}
```

### Restaurant Data

Update in `lib/mockData.ts`:

```typescript
export const mockRestaurant = {
  id: 'rest001',
  name: 'Your Restaurant Name',
};
```

### Number of Tables

Modify in `app/dashboard/tables/page.tsx`:

```typescript
const tables = Array.from({ length: 20 }, (_, i) => i + 1);
```

## Production Deployment

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_RESTAURANT_ID=rest001
NEXT_PUBLIC_API_URL=https://your-api.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential features for production:

- [ ] Real-time order updates (WebSocket/Server-Sent Events)
- [ ] QR code generation library integration
- [ ] Print functionality for kitchen orders
- [ ] Order history and analytics
- [ ] Multi-restaurant support
- [ ] Staff authentication
- [ ] Order notifications (sound/visual)
- [ ] Image upload for menu items
- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] Payment processing integration

## License

MIT License - feel free to use this project for your restaurant or modify it as needed.

## Support

For issues or questions:
- Check the code comments
- Review the mock data structure
- Ensure localStorage is enabled in browser

---

Built with Next.js and TypeScript for modern restaurant operations.
