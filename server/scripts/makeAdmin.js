const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run make-admin -- user@example.com");
  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
  if (!user) throw new Error("User not found");
  console.log(`Admin role granted to ${user.email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
