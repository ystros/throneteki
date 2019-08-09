const _ = require('underscore');

const logger = require('../log.js');

/*

* User submitting the report
* User being reported
* Reason for the report - could be pre-populated drop down, could be freeform text, could be both
* Game ID (if done within a game)
* Chat Log (if done within a game or maybe the specific lobby message if done there)
* Status - Submitted, Reviewed?

*/

class AbuseReportService {
    constructor(db) {
        this.abuseReports = db.get('abuseReports');
    }

    create({reportingUser, reportedUser, reason, gameId, log}) {
        const report = {
            reportingUser,
            reportedUser,
            reason,
            gameId,
            log,
            status: 'created',
            updates: []
        };
        return this.abuseReports.insert(report)
            .catch(err => {
                logger.error('Unable to create abuse report', err);
                throw new Error('Unable to create abuse report');
            });
    }

    updateStatus({ reportId, status, user }) {
        return this.abuseReports.update({ _id: reportId }, { '$set': { status } })
            .catch(err => {
                logger.error('Unable to update abuse report status', err);
                throw new Error('Unable to update abuse report status');
            });
    }

    getById(id) {
        return this.abuseReports.find({ _id: id }).then(reports => {
            return reports[0];
        }).catch(err => {
            logger.error(err);
        });
    }

    getAll() {
        return this.abuseReports.find({}).catch(err => {
            logger.error(err);
        });
    }
}

module.exports = AbuseReportService;

