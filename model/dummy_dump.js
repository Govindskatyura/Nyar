import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USERS_COUNT = 20;
const GROUPS_COUNT = 10;
const TRANSACTIONS_PER_GROUP = 50;

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createUsers() {
  const users = [];
  for (let i = 0; i < USERS_COUNT; i++) {
    const userId = `user${i + 1}`;
    const userData = {
      userId,
      email: `user${i + 1}@example.com`,
      displayName: `User ${i + 1}`,
      phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      profilePictureUrl: `https://example.com/profile${i + 1}.jpg`,
      createdAt: randomDate(new Date(2020, 0, 1), new Date()).toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId), userData);
    users.push(userId);
  }
  return users;
}

async function createGroups(users) {
  const groups = [];
  for (let i = 0; i < GROUPS_COUNT; i++) {
    const groupId = `group${i + 1}`;
    const memberCount = Math.floor(Math.random() * (users.length - 2)) + 2; // At least 2 members
    const members = {};
    for (let j = 0; j < memberCount; j++) {
      const userId = users[Math.floor(Math.random() * users.length)];
      members[userId] = {
        userId,
        role: j === 0 ? 'admin' : 'member',
        joinedAt: new Date().toISOString()
      };
    }
    const groupData = {
      groupId,
      name: `Group ${i + 1}`,
      description: `This is group ${i + 1}`,
      createdBy: Object.keys(members)[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members,
      lastTransactionId: ''
    };
    await setDoc(doc(db, 'groups', groupId), groupData);
    groups.push(groupId);

    // Update userGroups
    for (const userId of Object.keys(members)) {
      await setDoc(doc(db, 'userGroups', userId), { [groupId]: true }, { merge: true });
    }
  }
  return groups;
}

async function createTransactions(groups) {
  for (const groupId of groups) {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    const groupData = groupDoc.data();
    const members = Object.keys(groupData.members);

    for (let i = 0; i < TRANSACTIONS_PER_GROUP; i++) {
      const transactionId = `transaction${groupId}_${i + 1}`;
      const paidBy = members[Math.floor(Math.random() * members.length)];
      const amount = Math.floor(Math.random() * 10000) / 100; // Random amount up to $100
      const participants = {};
      const participantCount = Math.floor(Math.random() * members.length) + 1;
      const participantMembers = members.sort(() => 0.5 - Math.random()).slice(0, participantCount);
      
      for (const userId of participantMembers) {
        participants[userId] = {
          userId,
          share: amount / participantCount
        };
      }

      const transactionData = {
        transactionId,
        type: Math.random() > 0.2 ? 'expense' : 'settlement',
        createdBy: paidBy,
        amount,
        description: `Transaction ${i + 1} in ${groupData.name}`,
        category: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'][Math.floor(Math.random() * 4)],
        date: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupId:groupId,
        participants
      };

      console.log(transactionData);

    //   await setDoc(doc(db, 'transactions', groupId, transactionId), transactionData);
      await setDoc(doc(db, 'transactions', transactionId), transactionData);

      // Update group balances
      for (const [userId, participant] of Object.entries(participants)) {
        const balanceRef = doc(db, 'groupBalances', groupId);
        await setDoc(balanceRef, {
          [userId]: {
            balance: (userId === paidBy ? amount : 0) - participant.share
          }
        }, { merge: true });
      }

    //   // Update lastTransactionId in group
      await updateDoc(doc(db, 'groups', groupId), { lastTransactionId: transactionId });
    }
  }
}

async function createNotifications(users, groups) {
  for (const userId of users) {
    for (let i = 0; i < 10; i++) {
      const notificationId = `notification${userId}_${i + 1}`;
      const groupId = groups[Math.floor(Math.random() * groups.length)];
      const notificationData = {
        notificationId,
        type: ['new_expense', 'settlement_request', 'group_invite'][Math.floor(Math.random() * 3)],
        content: `Notification ${i + 1} for user ${userId}`,
        relatedGroupId: groupId,
        relatedTransactionId: `transaction${groupId}_${Math.floor(Math.random() * TRANSACTIONS_PER_GROUP) + 1}`,
        isRead: Math.random() > 0.5,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'userNotifications', userId,'notifications',notificationId), notificationData);
    }
  }
}

async function populateDatabase() {
  try {
    console.log('Creating users...');
    const users = await createUsers();
    console.log('Creating groups...');
    const groups = await createGroups(users);
    console.log('Creating transactions...');
    await createTransactions(groups);
    console.log('Creating notifications...');
    await createNotifications(users, groups);
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();