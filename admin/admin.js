const bcrypt = require("bcrypt");

async function Admin(){
    const hash = await bcrypt.hash("admin", 10);
    console.log(hash);
}

Admin();