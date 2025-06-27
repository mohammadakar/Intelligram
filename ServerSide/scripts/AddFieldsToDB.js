require('dotenv').config();
const mongoose = require('mongoose');
const { User }  = require('../Models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await User.updateMany(
    { requests: { $exists: false } },
    { $set: { requests: [] } }
  );
  console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
