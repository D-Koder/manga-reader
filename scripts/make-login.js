// Creates the login values for src/data/loginConfig.js.
// Usage (the password is read from the environment, not the command line):
//   read -s -p "Password: " PW; echo; PW="$PW" node scripts/make-login.js yourname
const crypto = require("crypto");

const username = process.argv[2];
const password = process.env.PW || "";

if (!username) {
  console.error("Give a username: node scripts/make-login.js yourname");
  process.exit(1);
}
if (password.length < 14) {
  console.error("Use a password of at least 14 characters (a long passphrase works well).");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 210000, 32, "sha256");

console.log(`export const LOGIN_USERNAME = "${username}";`);
console.log(`export const LOGIN_SALT = "${salt.toString("hex")}";`);
console.log(`export const LOGIN_HASH = "${hash.toString("hex")}";`);
