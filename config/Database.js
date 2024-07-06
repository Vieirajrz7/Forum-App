const Pool = require('pg').Pool;
require("dotenv").config();

const pool = new Pool ({ // -Conexão com o banco de dados
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATA,
    password: process.env.DB_PASSWORD

});

module.exports = pool