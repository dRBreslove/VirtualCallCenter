import { MongoClient } from 'mongodb';

export async function up(db, client) {
  // Create users collection
  await db.createCollection('users');
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ socialId: 1 }, { sparse: true });

  // Create calls collection
  await db.createCollection('calls');
  await db.collection('calls').createIndex({ phoneNumber: 1, createdAt: -1 });
  await db.collection('calls').createIndex({ status: 1 });
  await db.collection('calls').createIndex({ agent: 1 });

  // Create agents collection
  await db.createCollection('agents');
  await db.collection('agents').createIndex({ status: 1 });
  await db.collection('agents').createIndex({ 'performance.totalCalls': -1 });

  // Create admin user
  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$YourHashedPasswordHere', // You should replace this with a proper hashed password
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(adminUser);
}

export async function down(db, client) {
  // Drop collections
  await db.collection('users').drop();
  await db.collection('calls').drop();
  await db.collection('agents').drop();
} 