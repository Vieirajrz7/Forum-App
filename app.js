// Carregando Módulos
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
// const { Client } = require('pg');
const admin = require('./routes/admin');
const pool = require('./config/Database');


//TASK: VALIDAÇÕES DOS FORMULARIOS E ENCRIPTAÇÃO DAS SENHAS!!!!!!!!!!!!!!
// Querys

// Configs
app.use(session({
    secret: "blogperguntas",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Middlewares
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.err_msg = req.flash("err_msg");
    next();
});

// Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main', }))
app.set('view engine', 'handlebars');

// Public - Bootstrap
app.use(express.static(path.join(__dirname, "public")));

app.use('/admin', admin);

// Rotas

app.get('/', async (req, res) => {
    try {

        const sql = `SELECT * FROM questions ORDER BY created_at DESC`;
        const result = await pool.query(sql);

        const questionsData = result.rows.map((row) => {
            return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
        });

        res.render('index', { row: questionsData });

    } catch (err) {
        req.flash('err_msg', 'Houve Algum erro!!!');
        res.redirect('/')
    }
});

app.get('/question', (req, res) => {
    res.render('form-question');
});

app.post('/question/add', async (req, res) => {

    try {
        const sqlAdd = `INSERT INTO questions(title, content) VALUES ('${req.body.title}', '${req.body.content}')`;
        await pool.query(sqlAdd)
        req.flash('success_msg', 'Pergunta Enviada com Sucesso');
        res.redirect('/');

    } catch {
        req.flash('err_msg', 'Houve um erro ao Enviar a Pergunta!!!');
        res.redirect('/')

    }

});

app.get('/question/:id', async (req, res) => {

    try {
        const sql = `SELECT * FROM questions WHERE id=${req.params.id}`;
        const result = await pool.query(sql);

        const questionsData = result.rows.map((row) => {
            return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
        });

        const sqlExibir = `SELECT * FROM responses WHERE id_question=${req.params.id}`;
        const resultExibir = await pool.query(sqlExibir);

        const questionsDataExibir = resultExibir.rows.map((row) => {
            return { ...row };
        });


        res.render('question-info', { row: questionsData, rowExibir: questionsDataExibir });
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');

    }

});


app.get('/response/form-response/:id', async (req, res) => {

    try {
        const sql = `SELECT * FROM questions WHERE id=${req.params.id}`;
        const result = await pool.query(sql);
        const _id = req.params.id;

        const questionsData = result.rows.map((row) => {
            return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
        });

        res.render('form-response', { row: questionsData, _id: _id });
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');
        console.log(err)
    }

});

app.post('/response/save-response', async (req, res) => {

    try {
        const sqlSave = `INSERT INTO responses(content_res, id_question) VALUES ('${req.body.contentRes}', ${req.body._id});`;
        await pool.query(sqlSave);

        req.flash('success_msg', 'Resposta Enviada com Sucesso!');
        res.redirect(`/question/${req.body._id}`);
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');

    }

});

//Register

app.get('/form-register', (req, res) => {
    res.render('form-register');
});

app.post('/register-user', async (req, res) => {


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

})


const PORT = 3334;
app.listen(PORT, () => {
    console.log('Server Listening in Port 3334...');
});


// MODO ANTIGO DE FAZER AS QUERYS NAS ROTAS ROTA PRINCIPAL AQUI.

// app.get('/', (req, res) => {
// const client = new Client({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'prod-app-dev',
//     password: password
// });

// try {

//     await client.connect();

//     const sql = `SELECT * FROM questions ORDER BY created_at DESC`;
//     const result = await client.query(sql);

//     const questionsData = result.rows.map((row) => {
//         return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
//     });

//     res.render('index', { row: questionsData });
// } catch (err) {
//     req.flash('err_msg', 'Houve algum erro');
//     res.redirect('/');
//     console.log(err)
// } finally {
//     await client.end();
//     console.log('Client Disconnected succefully!');
// }

// })