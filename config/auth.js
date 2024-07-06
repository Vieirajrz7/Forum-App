const localStrategy = require('passport-local').Strategy;
const pool = require('./Database');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = function (passport) { // -autenticação do passport
    passport.use(
        new localStrategy({ usernameField: 'email' }, async (email, senha, done) => {
            try {
                const sql = `SELECT * FROM users WHERE email = $1`;
                const result = await pool.query(sql, [email]); // -procura no banco o email que é passado na hora do login

                const user = result.rows[0]; // -[0] diz que só tem um email para cada usuário

                if (!user) // -caso não encontre o email
                    return done(null, false, { message: 'Esta Conta não Existe!!!' });

                const senhaValida = await bcrypt.compare(senha, user.password); // -compara se a senha está correta

                if (!senhaValida)
                    return done(null, false, { message: 'Senha Incorreta!!!' });

                return done(null, user); // -caso dê tudo certo retorna o usuário
            } catch (error) {
                return done(error);
            }
        })
    );

    // -pega o objeto do usuário e armazenar seu id na sessão
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    // -recupera o objeto completo do usuário do banco de dados com base no id armazenado quando necessário.
    passport.deserializeUser(async (id, done) => {
        try {
            const sql = `SELECT * FROM users WHERE id = $1`;
            const query = await pool.query(sql, [id]);

            const user = query.rows[0];
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err);
        }
    });
};