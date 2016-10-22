var db = require('./pghelper'),
    activities = require('./activities'),
    winston = require('winston');

/**
 * Get user profile
 * @param req
 * @param res
 * @param next
 */
function getProfile(req, res, next) {
    var userId = req.userId,
        externalUserId = req.externalUserId;

    activities.getPointBalance(externalUserId)
        .then(function (activity) {
            db.query(
                    'SELECT id, firstName, lastName, email, mobilePhone, pictureURL__c as pictureURL, createddate, preference__c AS preference, size__c AS size, protein__c AS protein, frequency__c AS frequency, type__c AS type FROM salesforce.contact WHERE id=$1',
                    [userId], true)
                .then(function (user) {
                    user.points = activity.points;
                    user.status = activities.getStatus(activity.points);
                    res.send(JSON.stringify(user));
                })
                .catch(next);
        })
        .catch(next);
}

/**
 * Update user profile
 * @param req
 * @param res
 * @param next
 */
function updateProfile(req, res, next) {

    var user = req.body,
        userId = req.userId;

        console.log('-----------');
        console.log(user);

    console.log('updating: ' + JSON.stringify(user));

    db.query('update salesforce.contact SET firstName=$1, lastName=$2, mobilePhone=$3, pictureURL__c=$4, protein__c=$5, frequency__c=$6, type__c=$7 WHERE id=$8',
            [user.firstname, user.lastname, user.mobilephone, user.pictureurl, user.protein, user.frequency, user.type, userId])
        .then(function () {
            res.send(user);
        })
        .catch(next);
};

exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
