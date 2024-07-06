// -Carregando Módulos
const express = require('express');
const router = express.Router();
const pool = require('../config/Database');
const {isAdmin} = require('../helpers/user_verifications'); //-Verificação se o usuário é admin

// -Rotas Admin

router.get('/', isAdmin, async (req, res) => { // -Rota principal admin

    try {
        const sql = `SELECT * FROM questions ORDER BY created_at DESC`
        const result = await pool.query(sql); // -Exibe as perguntas

        const questionsData = result.rows.map((row) => {
            return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
        });

        res.render('admin/indexAdmin', { row: questionsData });
    } catch (err) {
        req.flash('err_msg', 'Houve um erro');
        res.redirect('/admin');
    }
});

router.post('/delete_question', isAdmin, async (req, res) => { // -Rota para deletar perguntas

    try {
        const sql = `DELETE FROM questions WHERE id = ${req.body.id}`;

        await pool.query(sql).then(() => { // -Roda a query para deletar uma pergunta referenciando pelo ID
            req.flash('success_msg', 'Pergunta e Respostas Excluida com Sucesso!');
            res.redirect('/admin');
        })

    } catch (err) { // -Trata o erro
        req.flash('err_msg', 'Houve um Erro ao Excluir a Pergunta ou as Respostas!!!');
        res.redirect('/admin');
    }
});

router.get('/admin-responses/:id', isAdmin, async (req, res) => { // -Exibe a pergunta e as suas respostas

    try {
        const sqlQuestion = `SELECT * FROM questions WHERE id=${req.params.id}`;
        const resultQuestion = await pool.query(sqlQuestion); // -Perguntas

        const questionsData = resultQuestion.rows;

        const sqlResponses = `SELECT * FROM responses WHERE id_question=${req.params.id}`;
        const resultResponses = await pool.query(sqlResponses); // -Respostas

        const responsesData = resultResponses.rows;

        // -Passa os dados para o template
        res.render('admin/responsesAdmin', { rowQuestion: questionsData, rowResponses: responsesData });
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');
    }
});

router.post('/delete-response', isAdmin, async (req, res) => { // -Rota para deletar respostas

    try {
        const sql = `DELETE FROM responses WHERE id=${req.body.id_response}`
        await pool.query(sql).then(() => { // -Deleta a resposta referenciando o ID
            req.flash('success_msg', 'Resposta Excluida com Sucesso!');
            res.redirect('/admin');
        })

    } catch (err) {
        req.flash('err_msg', 'Houve um Erro ao Excluir a Resposta!!!');
        res.redirect('/admin');
    }
});

module.exports = router