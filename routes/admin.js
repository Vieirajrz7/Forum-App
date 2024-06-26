const express = require('express');
const router = express.Router();
// const { Client } = require('pg');
// const pg = require('pg');
const pool = require('../config/Database');


router.get('/', async (req, res) => {

    try {
        const sql = `SELECT * FROM questions ORDER BY created_at DESC`
        const result = await pool.query(sql);

        const questionsData = result.rows.map((row) => {
            return { ...row, formattedCreatedAt: row.created_at.toLocaleDateString('pt-BR') };
        });

        res.render('admin/indexAdmin', { row: questionsData });
    } catch (err) {
        req.flash('err_msg', 'Houve um erro');
        res.redirect('/admin');
    }

});

router.post('/delete_question', async (req, res) => {

    try {
        const sql = `DELETE FROM questions WHERE id = ${req.body.id}`;

        await pool.query(sql).then(() => {
            req.flash('success_msg', 'Pergunta e Respostas Excluida com Sucesso!');
            res.redirect('/admin');
        })

    } catch (err) {
        req.flash('err_msg', 'Houve um Erro ao Excluir a Pergunta ou as Respostas!!!');
        res.redirect('/admin');
    }

});

router.get('/admin-responses/:id', async (req, res) => {

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

        res.render('admin/responsesAdmin', { row: questionsData, rowExibir: questionsDataExibir });
    } catch (err) {

        req.flash('err_msg', 'Houve algum erro');
        res.redirect('/');
        console.log(err)

    }

});

router.post('/delete-response', async (req, res) => {

    try {
        const sql = `DELETE FROM responses WHERE id=${req.body.id_response}`
        await pool.query(sql).then(() => {
            req.flash('success_msg', 'Resposta Excluida com Sucesso!');
            res.redirect('/admin');
        })

    } catch (err) {
        req.flash('err_msg', 'Houve um Erro ao Excluir a Resposta!!!');
        res.redirect('/admin');
    }

});



module.exports = router
