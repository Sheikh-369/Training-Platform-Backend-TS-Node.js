const bcrypt = require('bcrypt');

const plain = "12801_Zunaid Sheikh";
const hash = "$2b$10$paNiAFPT6TrSp/Me6jXkGukCS5Rb8aTMeuVUcURp1WVKzBf/gXpsG";

const result = bcrypt.compareSync(plain, hash);
console.log("Password match result:", result); // should log: true
