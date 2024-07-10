var express = require('express');
var router = express.Router();

const ControllerLMSContent = require('../controller/ControllerLMSContent')
const ControllerLMSLogging = require('../controller/ControllerLMSLogging')

// ---------- LMSContent Routes ----------
// ========== API ==========
router.get('/API/LMSContent/:id', function (req, res) {
    ControllerLMSContent.read(req, res)
})

router.post('/API/LMSContent', function (req, res) {
    ControllerLMSContent.created(req, res)
})

// ---------- LMSLogging Routes ----------
// ========== API ==========
router.get('/API/LMSLogging/:lmsl_id', function (req, res) {
    ControllerLMSLogging.read(req, res)
})

router.post('/API/LMSLogging', function (req, res) {
    ControllerLMSLogging.created(req, res)
})

module.exports = router;