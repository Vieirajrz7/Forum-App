// -Carregando Módulos
const express = require('express');
const router = express.Router();
const pool = require('../config/Database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { alreadyLogged } = require('../helpers/user_verifications'); // -Verificação para ver se já esta logado

router.get('/form-register', (req, res) => { // -Carrega o Formulário de registro
    res.render('form-register');
});

router.post('/register-user', async (req, res) => { // -Registra o usuário no banco de dados

    //VALIDATIONS

    var erros = [];

    if (!req.body.username || typeof req.body.username == undefined || req.body.username == null) {
        erros.push({
            errorText: "Campo de Nome Usuário Não Pode ser Vazio!!!"
        });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({
            errorText: "Campo de Email Não Pode ser Vazio!!!"
        });
    }

    //EMAIL ALREADY EXIST??

    const sqlEmail = `SELECT * FROM users WHERE email='${req.body.email}';`;
    const queryResult = await pool.query(sqlEmail);
    const results = queryResult.rows;

    if (results.length > 0) {
        erros.push({
            errorText: "Este Email já Existe no Sistema!!!"
        });
    };

    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({
            errorText: "Campo de Não Pode ser Vazio!!!"
        });
    }

    if (erros.length > 0) {
        res.render('form-register', { erros: erros });
    } else {
        //REGISTER USER

        //CREATING HASH FOR PASSWORD
        let userPassword = req.body.password;

        bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(userPassword, salt, async (err, hash) => {
                if (err) {
                    req.flash('err_msg', 'Houve um erro durante o cadastro do usuário');
                    res.redirect('/')
                    return;
                }

                userPassword = hash;

                //- Inserindo os dados
                try {
                    const sql = `INSERT INTO users(username, email, password, is_admin) VALUES
                     ('${req.body.username}', '${req.body.email}', '${userPassword}', true)`;

                    await pool.query(sql).then(() => {
                        req.flash('success_msg', 'Conta Registrada com Sucesso!');
                        res.redirect('/')
                    })
                } catch (err) {
                    req.flash('err_msg', 'Houve algum erro ao se cadastrar!!!');
                    res.redirect('/');
                }

            });
        });

    }
});

// -Login
router.get('/form-login', alreadyLogged, (req, res) => { // -Carrega o Formulário de login
    res.render('form-login');
});

router.post('/login-user', alreadyLogged, (req, res, next) => { // -Autentica o usuário (tudo pelo passport-js)

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/form-login",
        failureFlash: true
    })(req, res, next)
});

router.get('/logout', (req, res, next) => { // -Desconecta o usuário
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Conta desconectada com Sucesso!');
        res.redirect('/');
    });
});

module.exports = router;