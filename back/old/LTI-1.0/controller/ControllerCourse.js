const debug = require('debug')('ControllerCourse')
const ModelCourse = require('../model/ModelCourse')


module.exports.addP = async function (req, res) {
    debug("Add a target profile to a course")
    let success = await ModelCourse.addP(req.body.c_id, req.body.p_id)
    if (success) {
        res.status(200).end()
    } else {
        res.status(500).end()
    }
}

module.exports.addUser = async function (req, res) {
    debug('Add a user to a course')
    let success = await ModelCourse.addUser(req.body.c_id, req.body.user_id)
    if (success) {
        res.status(200).end()
    } else {
        res.status(500).end()
    }
}

module.exports.created = async function (req, res) {
    debug('Create a new course')

    let data = {
        'c_id': req.body.c_id,
        'name': req.body.name,
        'available': req.body.available,
        'description': req.body.description
    }

    let course = new ModelCourse(data)
    let success = await course.save()

    if (success) {
        res.status(200).end(JSON.stringify({
            message: 'SUCCESS ID : ' + success,
            id: success
        }))
    } else {
        res.status(500).end()
    }

}

module.exports.delAllP = async function (res, res) {
    debug('Delete all target profiles from a course')
    let success = await ModelCourse.delAllP(req.params.p_id)
    if (success) {
        res.status(200).end()
    } else {
        res.status(500).end()
    }
}

module.exports.delAllUser = async function (req, res) {
    debug('Delete all users from a course')
    let success = await ModelCourse.delAllUser(req.params.c_id)
    if (success) {
        res.status(200).end()
    } else {
        res.status(500).end()
    }
}

module.exports.delP = async function (req, res) {
    debug('Delete a target profile from a course')
    let success = await ModelCourse.delP(req.params.c_id, req.params.p_id)
    if (success) {
        res.status(200).end()
    } else {
        res.status(500).end()
    }
}

module.exports.readAPI = async function (req, res) {
    debug('API Get a course')
    let course = await ModelCourse.read(req.params.c_id)
    if (course) {
        res.status(200).end(JSON.stringify(course))
    } else {
        res.status(500).end()
    }
}

module.exports.readCourseUserAPI = async function (req, res) {
    debug('Read all courses to which a user is registered')
    let tabCourse = await ModelCourse.readCourseUser(req.params.user_id)
    if (tabCourse) {
        res.status(200).end(JSON.stringify(tabCourse))
    } else {
        res.status(500).end()
    }
}

module.exports.readUserRegAPI = async function (req, res) {
    debug('Read all user registered for a course')
    let tab = await ModelCourse.readUserReg(req.params.c_id)
    if (tab) {
        res.status(200).end(JSON.stringify(tab))
    } else {
        res.status(500).end()
    }
}