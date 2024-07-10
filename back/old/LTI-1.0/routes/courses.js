var express = require('express');
var router = express.Router();

const ControllerCourse = require('../controller/ControllerCourse')

const accessControl = require('../middlewares/accessControl')
const roleControl = require('../middlewares/checkRole')
const connection = accessControl.checkConnection
const role = roleControl.checkRole

// ========== API =========
// Add user to a course
router.post('/API/course/addUser',connection, role("Enseignant"), function (req, res) {
    ControllerCourse.addUser(req, res)
})

// Create
router.post('/course',connection, role("Enseignant"), function (req, res) {
    ControllerCourse.created(req, res)
})

// Delete All User
router.delete('/API/course/delAllUser/:c_id',connection, role("Enseignant"), function (req, res) {
    ControllerCourse.delAllUser(req, res)
})

// Get a course
router.get('/API/course/:c_id',connection, role("Enseignant"), function (req, res) {
    ControllerCourse.readAPI(req, res)
})

// Read courses for an user
router.get('/API/course/user/:user_id',connection, role("Enseignant"), function (req, res) {
    ControllerCourse.readCourseUserAPI(req, res)
})

// Read users registered to a course
router.get('/API/course/regUser/:c_id', function (req, res) {
    ControllerCourse.readUserRegAPI(req, res)
})

module.exports = router;