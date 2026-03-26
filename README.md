# Grocery Marking App

A simple, fast PWA for marking and managing grocery items with swipeable cards.

## Features

- Swipeable cards for easy item management
- Increase/decrease quantity and unit price
- Reset cart button
- Share list via WhatsApp
- Persistent local storage (IndexedDB)
- Installable as PWA on mobile
- Works offline

## Quick Start

1. Open `index.html` in a browser
2. Add grocery items with name, price, and quantity
3. Swipe cards left to move items to "unselected"
4. Click unselected items to bring them back
5. Use WhatsApp button to share your list

## PWA Installation

On mobile:
1. Open the app in Chrome/Safari
2. Tap "Add to Home Screen" in the menu

## Firebase Hosting Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for deployment instructions.

## Tech Stack

- Vanilla JavaScript (no frameworks)
- IndexedDB for local storage
- Service Worker for offline support
- Firebase Hosting for deployment
