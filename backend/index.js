const app = require("./setup-server");

const { resetDatabase } = require("./database_functions/reset_database");
// resetDatabase().catch(e => console.log(e));

let host = "0.0.0.0";
app.listen(8888, host, () => console.log(`Listening on ${host}:8888`));
