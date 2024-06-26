const express = require('express');
const router = express.Router();
const pool = require('../config/Database');
const bcrypt = require('bcryptjs');

router.get('/form-register', (req, res) => {
    res.render('form-register');
});

router.post('/register-user', async (req, res) => {

    var erros = [];

    if (!req.body.username || typeof req.body.username == undefined || req.body.username == null) {
        erros.push({
            errorText: "Campo de Nome Usuário Inválido!!!"
        });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({
            errorText: "Campo de Email Inválido!!!"
        });
    }
    let alreadyExist = false;
    try {
        const sqlEmail = `SELECT email FROM users WHERE email='${req.body.email}';`;
        await pool.query(sqlEmail).then(() => {
            alreadyExist = true;
        });

    } catch (err) {
        console.log('Email Disponivel');
    }

    if (alreadyExist) {
        erros.push({
            errorText: "Este Email já Existe no Sistema"
        });
    };

    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({
            errorText: "Campo de Senha Inválido!!!"
        });
    }

    if (erros.length > 0) {
        res.render('form-register', { erros: erros });
    } else {

        try {
            const sql = `INSERT INTO users(username, email, password) VALUES
             ('${req.body.username}', '${req.body.email}', '${req.body.password}')`;
            await pool.query(sql).then(() => {
                req.flash('success_msg', 'Conta Registrada com Sucesso!');
                res.redirect('/')
            })
        } catch (err) {
            req.flash('err_msg', 'Houve algum erro ao se cadastrar!!!');
            res.redirect('/');
        }
    }
})


module.exports = router;