# Create My Journey

Create My Journey is a React + Vite travel planning application where users can build a trip manually, step by step, and review all selected choices in one final itinerary view.

The app currently focuses on a guided Tokyo demo flow with mock data for transport, accommodation, restaurants, and attractions.

## What The Project Does

- Collects trip context from a travel form on the home page.
- Guides users through a manual planning pipeline:
	- Transport selection
	- Accommodation selection
	- Restaurant selection
	- Attraction selection
- Passes selected items between pages through in-app navigation state.
- Combines all selected items in the Review page and distributes them across trip days.
- Lets users reorder items in Review using drag and drop.

## Tech Stack

- React 19
- Vite 8
- Plain CSS modules per page/component (no external UI framework)
- ESLint for linting

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run In Development

```bash
npm run dev
```

### Build For Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Main Application Flow

The app uses a simple internal page state in App.jsx instead of React Router.

Flow for manual planning:

1. Home
2. Transport
3. ChooseAccommodation
4. Restaurants
5. ChooseAttractions
6. Review

Each page sends its selected items forward via the shared navigate function and navigation payload.

## Main Components And Pages

### App Shell

- src/App.jsx
	- Central navigation state manager.
	- Decides which page component to render.
	- Stores and forwards navigation payload between pages.

### Pages

- src/pages/Home.jsx
	- Landing page.
	- Displays form and mode selection panels.
	- Starts manual flow by navigating to Transport.

- src/pages/Transport.jsx
	- Multi-segment transport chooser.
	- Converts selected transport options into card-compatible items.
	- Navigates to accommodation step.

- src/pages/ChooseAccommodation.jsx
	- Single-choice accommodation selector.
	- Converts selected accommodation into card-compatible item.
	- Navigates to restaurants step.

- src/pages/Restaurants.jsx
	- Multi-select restaurant planner.
	- Uses the same card presentation pattern as attractions.
	- Navigates to attractions step.

- src/pages/ChooseAttractions.jsx
	- Multi-select attraction planner.
	- Sends all selected lists to review.

- src/pages/Review.jsx
	- Merges transport, accommodation, restaurant, and attraction selections.
	- Labels item source type.
	- Splits items across nights and supports drag-drop reorder.

- src/pages/Register.jsx
	- Registration/auth UI entry.

### Reusable UI Components

- src/components/Navbar.jsx
- src/components/HamburgerMenu.jsx
- src/components/TravelForm.jsx
- src/components/ModePanels.jsx
- src/components/AttractionCard.jsx
- src/components/AccommodationCard.jsx

These components provide shared UI primitives used throughout the planning flow.

## Data Shape For Selected Items

To render mixed selections consistently in Review, page selections are normalized to a card-friendly object shape:

- id
- name
- category
- hours
- price
- rating
- tags
- description
- image

Review then enriches each item with an itemType field to show source labels.

## Project Structure

Top-level folders of interest:

- public
- src
	- components
	- pages
	- assets

## Current Notes

- Data is currently mock/demo data (Tokyo-focused).
- Navigation is state-driven inside App.jsx and does not persist across refreshes.
- Authentication is local-storage based for basic user state simulation.

## Future Improvements

- Replace mock datasets with API-backed data.
- Add React Router for URL-based navigation.
- Persist trip drafts in backend or local storage.
- Add test coverage for page-to-page state handoff.
- Add i18n and accessibility refinements.
