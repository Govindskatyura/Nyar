# Splitwise Clone

A React Native application that mimics the core functionality of Splitwise, allowing users to split expenses within groups.

## Features

- User authentication
- Create and manage groups
- Add expenses and split them among group members
- View group summaries and individual balances
- Invite new users to groups
- Visualize expenses with charts

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm or Yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device for testing)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/splitwise-clone.git
   cd splitwise-clone
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or if you're using Yarn:
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   Replace the values with your actual Firebase configuration.

## Configuration

1. Ensure you have set up a Firebase project and enabled Firestore.
2. Update the Firebase configuration in `config/firebase.js` to use the environment variables:

   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FEXPO_PUBLIC_IREBASE_MESSAGING_SENDER_ID,
     appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const database = getFirestore(app);
   ```

## Running the App

1. Start the Expo development server:
   ```
   npm run ios
   ```
   or 
   ```
   npm run android
   ```

2. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## Project Structure

- `/screens`: Contains all the screen components
- `/components`: Reusable UI components
- `/utils`: Utility functions and Firebase interactions
- `/config`: Configuration files, including Firebase setup
- `/assets`: Images, fonts, and other static assets

## Key Files

- `App.js`: Main application component and navigation setup
- `screens/GroupInfoScreen.js`: Group details and expense summary
- `screens/AddExpenseScreen.js`: Form to add new expenses
- `utils/firebaseUtils.js`: Firebase interaction functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
```

This README provides a comprehensive overview of your project, including setup instructions, configuration details (especially for the .env file), and a brief description of the project structure and key files. You may want to customize it further based on any specific details or additional features of your implementation.

Remember to replace "your-username" in the clone URL with your actual GitHub username if you're hosting the project there. Also, if you have any specific coding standards, testing procedures, or contribution guidelines, you might want to add those sections to the README as well.