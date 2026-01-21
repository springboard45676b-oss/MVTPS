# Mini Food Ordering App (Expo + Firebase)

## Features
- Real-time menu fetching from Firestore
- Add to cart with quantity
- Cart screen to update/remove items
- Order submission saved to Firestore

## Setup
1. Install Expo CLI and dependencies: `npm install` or `yarn`
2. Replace Firebase config in `src/firebase/firebaseConfig.js` with your project values.
3. Run `expo start` and open on a device/emulator.

## Firestore collections
- `menu` (documents) with fields: `name` (string), `description` (string), `price` (number), `image` (string URL)
- `orders` (documents) created by the app with fields: `items` (array), `total` (number), `createdAt` (timestamp), `status` (string)

## Screenshots
Place screenshots in the `screenshots/` folder and include them in the zip for submission.
