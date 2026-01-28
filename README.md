# ✈️ Flight Search App

A modern, feature-rich flight search application built with React 19, TypeScript, and the Amadeus API. Search for flights worldwide with real-time pricing, advanced filtering, and a beautiful responsive UI.

![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan?logo=tailwindcss)

## ✨ Features

- 🔍 **Worldwide Airport Search** - Search airports by city, name, or IATA code using Amadeus API
- 🛫 **Flight Search** - One-way and round-trip flight searches with real pricing
- 💰 **Price Insights** - Price analysis with visual graphs
- 🎛️ **Advanced Filtering** - Filter by stops, price, duration, airlines, and departure time
- 📱 **Responsive Design** - Mobile-first design with desktop optimizations
- 🔗 **URL State Management** - Shareable URLs with search parameters via nuqs
- ⚡ **Optimized Performance** - React Query caching, debounced searches, and React Compiler

## 🏗️ Project Structure

```
src/
├── components/
│   └── ui/                    # Reusable UI components (shadcn/ui)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       └── ...
│
├── features/
│   └── flights/               # Flight search feature module
│       ├── api/               # API layer
│       │   └── flights.api.ts # Amadeus API integration
│       │
│       ├── components/        # Feature-specific components
│       │   ├── airport-select.tsx     # Airport autocomplete
│       │   ├── date-picker.tsx        # Single date picker
│       │   ├── date-range-picker.tsx  # Date range for round trips
│       │   ├── flight-card.tsx        # Flight result card
│       │   ├── flight-filters.tsx     # Desktop & mobile filters
│       │   ├── flight-results-list.tsx
│       │   ├── flight-skeleton.tsx    # Loading states
│       │   ├── price-graph.tsx        # Price distribution chart
│       │   └── search-form.tsx        # Main search form
│       │
│       ├── hooks/             # Custom React hooks
│       │   ├── use-debounced-value.ts # Debounce for search
│       │   └── use-flight-params.ts   # URL state management
│       │
│       ├── queries/           # TanStack Query hooks
│       │   └── index.ts       # useFlightSearch, useAirportSearch
│       │
│       ├── schemas/           # Zod validation schemas
│       │   └── flight.schema.ts
│       │
│       └── utils/             # Utility functions
│           └── flight.utils.ts # Formatting, filtering, sorting
│
├── pages/
│   └── flight-search-page.tsx # Main page component
│
├── providers/
│   └── query-provider.tsx     # React Query provider
│
├── router/
│   └── app-router.tsx         # React Router configuration
│
├── lib/
│   └── utils.ts               # Shared utilities (cn helper)
│
└── main.tsx                   # App entry point
```

## 🛠️ Tech Stack

### Core
| Library | Version | Purpose |
|---------|---------|---------|
| [React](https://react.dev) | 19.2.0 | UI framework with React Compiler |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [Vite](https://vite.dev) | 7.2.4 | Build tool & dev server |

### Styling
| Library | Version | Purpose |
|---------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com) | 4.1 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com) | - | UI component library |
| [Radix UI](https://radix-ui.com) | Various | Accessible primitives |
| [Lucide React](https://lucide.dev) | 0.563 | Icons |

### State & Data
| Library | Version | Purpose |
|---------|---------|---------|
| [TanStack Query](https://tanstack.com/query) | 5.90 | Server state management |
| [nuqs](https://nuqs.47ng.com) | 2.8.6 | URL search params state |
| [Axios](https://axios-http.com) | 1.13 | HTTP client |
| [Zod](https://zod.dev) | 4.3 | Schema validation |

### UI Components
| Library | Version | Purpose |
|---------|---------|---------|
| [React Day Picker](https://react-day-picker.js.org) | 9.13 | Date selection |
| [Recharts](https://recharts.org) | 2.15 | Price graph visualization |
| [cmdk](https://cmdk.paco.me) | 1.1 | Command menu for airport search |
| [date-fns](https://date-fns.org) | 4.1 | Date formatting |

### Routing
| Library | Version | Purpose |
|---------|---------|---------|
| [React Router](https://reactrouter.com) | 7.13 | Client-side routing |

### Testing
| Library | Version | Purpose |
|---------|---------|---------|
| [Vitest](https://vitest.dev) | 4.0 | Test runner |
| [Testing Library](https://testing-library.com) | 16.3 | Component testing |
| [jsdom](https://github.com/jsdom/jsdom) | 27.4 | DOM simulation |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd flight-search
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file with your Amadeus API credentials:
```env
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
```

Get your free API credentials at [Amadeus for Developers](https://developers.amadeus.com).

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ui` | Run tests with Vitest UI |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |

## 🔌 API Integration

The app uses [Amadeus APIs](https://developers.amadeus.com/self-service/apis-docs):

- **Airport & City Search API** - Autocomplete for airport selection
- **Flight Offers Search API** - Real-time flight pricing

API requests are proxied through Vite's dev server to handle authentication:

```typescript
// vite.config.ts proxy configuration
'/api/amadeus/auth'      → OAuth token endpoint
'/api/amadeus/locations' → Airport search
'/api/amadeus/flights'   → Flight offers search
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com) - a collection of re-usable components built on Radix UI primitives:

- **Button, Card, Badge** - Core UI elements
- **Select, Checkbox, Slider** - Form controls
- **Dialog, Sheet, Popover** - Overlays
- **Command** - Airport search combobox
- **Calendar** - Date picker

## 🧪 Testing

Tests are written with Vitest and Testing Library:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

Test files are co-located with components:
```
flight-card.tsx
flight-card.test.tsx
```

## 📁 Feature-Based Architecture

The project follows a feature-based architecture where related code is grouped together:

```
features/flights/
├── api/        # API calls and types
├── components/ # UI components
├── hooks/      # Custom hooks
├── queries/    # React Query hooks
├── schemas/    # Zod schemas
└── utils/      # Helper functions
```

This makes the codebase:
- **Scalable** - Easy to add new features
- **Maintainable** - Related code stays together
- **Testable** - Clear boundaries for testing

## 🔗 URL State Management

Search parameters are synced to the URL using [nuqs](https://nuqs.47ng.com):

```
http://localhost:5173/\?from\=DEL\&to\=BLR\&date\=2026-02-21\&type\=2\&adults\=1
```

This enables:
- Shareable search URLs
- Browser back/forward navigation
- Bookmarkable searches
- Page refresh persistence

## 📱 Responsive Design

- **Mobile**: Single column layout with bottom sheet filters
- **Desktop**: Two-column layout with sticky sidebar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
