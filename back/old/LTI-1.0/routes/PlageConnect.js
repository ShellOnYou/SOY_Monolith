// Travail Hugo Leclere : accès à une ressource Moodle pour un utilisateur de Plage
// mettre en conformité avec le reste de l'app Plage 
// (qui a pas mal évolué depuis que PlageConnect a été proposé)

var express = require('express');
var router = express.Router();

const ControllerPlageConnect = require('../controller/ControllerPlageConnect')

const ModelPlageConnect = require('../model/ModelPlageConnect')
router.get('/test', function(req, res, next) {res.send(req.session);console.log(req.session)});


router.post('/moodle/token', (req, res) => {
    ModelPlageConnect.MoodleToken(req, res)
})

// Returns a token+userId if valid id/pwd
router.post('/login', (req, res) => {
    ModelPlageConnect.login(req, res)
})

router.post('/logout', (req, res) => {
    ModelPlageConnect.logout(req, res)
})

router.get('/login', (req, res) => {
    ControllerPlageConnect.login(req, res)
})


module.exports = router;