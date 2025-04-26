const { enrollAdmin } = require('./fabric/wallet');
require('dotenv').config();

async function main() {
  try {
    await enrollAdmin();
    console.log('Admin enrolled successfully');
  } catch (error) {
    console.error(`Failed to enroll admin: ${error}`);
    process.exit(1);
  }
}

main();
