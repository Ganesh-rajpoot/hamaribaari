// /* eslint-disable no-console */
// const { execSync } = require('child_process');
// const path = require('path');

// module.exports = async () => {
//   const cwd = path.resolve(__dirname, '..');
//   process.env.NODE_ENV = 'test';
//   console.log('[jest] applying migrations to test DB');
//   execSync('npx prisma migrate deploy', { cwd, stdio: 'inherit', env: process.env });
// };

/* eslint-disable no-console */
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  const cwd = path.resolve(__dirname, '..');
  process.env.NODE_ENV = 'test';

  console.log('[jest] applying migrations to TEST database');
  execSync(
    'npx cross-env NODE_ENV=test dotenv -e .env.test -o -- prisma migrate deploy',
    { cwd, stdio: 'inherit', env: process.env }
  );
};