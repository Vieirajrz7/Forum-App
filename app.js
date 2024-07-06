// Carregando Módulos
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const admin = require('./routes/admin');
const users = require('./routes/users');
const pool = require('./config/Database'); // -Pool de conexão com o banco de dados.
const passport = require('passport');
require('./config/auth')(passport);
const { isLogged } = require('./helpers/user_verifications'); // -Verificação se o usuário esta logado.

//TASK:FAZER UMA EXPLICAÇÃO NO GITHUB DO PROJETO DO PQ EU FIZ ELE COLOCAR TBM IMAGENS!!!!!!!!

// -Configurações
app.use(express.json());
app.use(session({
    secret: "blogperguntas",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// -Middlewares / Variáveis Globais
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.err_msg = req.flash("err_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// -Body-Parser - Config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// -Handlebars - Config
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main', }));
app.set('view engine', 'handlebars');

// -Public - Bootstrap
app.use(express.static(path.join(__dirname, "public"))); // -Esta fazendo a ligação com a pasta public

// -Conjunto de Rotas
app.use('/admin', admin); // -Rotas de Administrador
app.use('/users', users); // -Rotas de Usuários

// -Rotas

app.get('/', async (req, res) => { // -Raiz
    try {
        const sql = `SELECT * FROM questions ORDER BY created_at DESC`;
        const result = await pool.query(sql);

        const questionsData = result.rows

        res.render('index', { row: questionsData }); /* -Passa os dados das linhas encontradas na query 
        feita ao banco de dados para o template 'index' para ser exibido lá */

    } catch (err) { // -tratar erro
        req.flash('err_msg', 'Houve Algum erro!!!');
        res.redirect('/')
    }
});
app.get('/question', isLogged, (req, res) => { // -Carregar o Formulário Perguntar
    res.render('form-question');
});

app.post('/question/add', isLogged, async (req, res) => { // -Salvando a Pergunta

    // -Validações do formulário
    let erros = [];

    if (!req.body.title || typeof req.body.title == undefined || req.body.title == null) {
        erros.push({
            errorText: "Campo de Titulo Inválido!!!"
        });
    }

    if (!req.body.content || typeof req.body.content == undefined || req.body.content == null) {
        erros.push({
            errorText: "Campo de Conteúdo Inválido!!!"
        });
    }

    if (req.body.title.length <= 5) {
        erros.push({
            errorText: "Campo do Titulo Muito Curto!!!"
        })
    };


    if (erros.length > 0) {
        res.render('form-question', { erros: erros });
    } else {
        // -Enviando para o banco de dados
        try {
            const sqlAdd = `INSERT INTO questions(title, content) VALUES ('${req.body.title}', '${req.body.content}')`;
            await pool.query(sqlAdd); // -Inserindo os dados no Banco de Dados
            req.flash('success_msg', 'Pergunta Enviada com Sucesso');
            res.redirect('/');

        } catch (err) {
            req.flash('err_msg', 'Houve um erro ao Enviar a Pergunta!!!');
            res.redirect('/');
            console.log(err)

        }
    }
});

app.get('/question/:id', isLogged, async (req, res) => { // -Exibir/Ver a Pergunta e as Respostas dela

    try {
        const sql = `SELECT * FROM questions WHERE id=${req.params.id}`;
        const result = await pool.query(sql); // -Exibe a Pergunta
        const questionsData = result.rows; // -Pega a propriedade rows que é retornada da requisição com o banco de dados
        
        const sqlResponses = `SELECT * FROM responses WHERE id_question=${req.params.id}`;
        const resultResponses = await pool.query(sqlResponses); // -Exibe as Respostas Referente aquela Pergunta
        const responsesData = resultResponses.rows;

        res.render('question-info', { rowQuestions: questionsData, rowResponses: responsesData });
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');
    }
});


app.get('/response/form-response/:id', isLogged, async (req, res) => { // -Formulário de Resposta

    const _id = req.params.id; // -Id da pergunta para saber aonde vai entrar a resposta
    res.render('form-response', { _id: _id });
});

app.post('/response/save-response/:id', isLogged, async (req, res) => { // -Salvando a Resposta
    try {
        const sqlSave = `INSERT INTO responses(content_res, id_question) VALUES
             ('${req.body.contentRes}', ${req.body._id});`;

        await pool.query(sqlSave); // -Inserindo os Dados no Banco de Dados

        req.flash('success_msg', 'Resposta Enviada com Sucesso!');
        res.redirect(`/question/${req.body._id}`); // -Voltando para a pergunta referente
    } catch (err) {
        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');
    }
});
// -Servidor
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