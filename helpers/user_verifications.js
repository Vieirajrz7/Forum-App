module.exports = { // -Middlewares para permissões de acesso
    isAdmin: function (req, res, next) {

        if (req.user && req.user.is_admin) { // -Permissão para ADM
            return next();
        }
        req.flash('err_msg', 'Você não é um Administrador para entrar aqui!!!');
        res.redirect('/');
    },

    isLogged: function (req, res, next) {

        if (req.isAuthenticated()) { // -Permissão para quem esta logado
            return next();
        }
        req.flash('err_msg', 'Você precisa se conectar em uma conta para entrar aqui!!!');
        res.redirect('/');
    },
    alreadyLogged: function (req, res, next) {

        if (!req.isAuthenticated()) { // -Proibição para quem já logou
            return next();
        }
        req.flash('err_msg', 'Você já esta conectado a uma conta!!!');
        res.redirect('/');
    }
}