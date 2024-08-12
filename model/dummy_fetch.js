import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    // Your Firebase configuration
    apiKey: "AIzaSyDE7snG6Al2MtCOo9tK7gFHvDUbJefeXjU",
    authDomain: "nyar-5feb1.firebaseapp.com",
    projectId: "nyar-5feb1",
    storageBucket: "nyar-5feb1.appspot.com",
    messagingSenderId: "610209379755",
    appId: "1:610209379755:web:a0a2df610c2e5bc68f8eee",
    measurementId: "G-3553BSK5JL"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchUserInfo(userId) {
  try {
    // Fetch user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    // Fetch user's groups
    const userGroupsDoc = await getDoc(doc(db, 'userGroups', userId));
    const userGroupIds = userGroupsDoc.exists() ? Object.keys(userGroupsDoc.data()) : [];
    const groupsPromises = userGroupIds.map(groupId => getDoc(doc(db, 'groups', groupId)));
    const groupDocs = await Promise.all(groupsPromises);
    const groups = groupDocs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch user's transactions across all groups
    const transactions = [];
    for (const groupId of userGroupIds) {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where(`participants.${userId}`, '!=', null)
      );
      const transactionsDocs = await getDocs(transactionsQuery);
      // console.log(transactionsDocs);
      transactions.push(...transactionsDocs.docs.map(doc => ({ id: doc.id, groupId, ...doc.data() })));
    }

    // Fetch user's balances across all groups
    const balances = {};
    for (const groupId of userGroupIds) {
      const balanceDoc = await getDoc(doc(db, 'groupBalances', groupId));
      if (balanceDoc.exists() && balanceDoc.data()[userId]) {
        balances[groupId] = balanceDoc.data()[userId].balance;
      }
    }

    // Fetch user's notifications
    const notificationsQuery = query(collection(db, 'userNotifications', userId,"notifications"));
    const notificationsDocs = await getDocs(notificationsQuery);
    const notifications = notificationsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      user: userData,
      groups,
      transactions,
      balances,
      notifications
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

// Usage
fetchUserInfo('user1')
  .then(userInfo => {
    console.log('User Info:', JSON.stringify(userInfo, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });