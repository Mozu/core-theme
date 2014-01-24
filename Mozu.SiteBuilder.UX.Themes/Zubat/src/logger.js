var color = require('cli-color'),
    constants = require('./constants'),

    severities = [
        constants.LOG_SEV_ERROR, 
        constants.LOG_SEV_SUCCESS,
        constants.LOG_SEV_WARN,
        constants.LOG_SEV_INFO
    ],

    formats = [
        color.red.bold,
        color.green.bold,
        color.yellow.bold,
        color.bold
    ],

    logger = {};

severities.forEach(function (sev, i) {
    logger[sev] = function (str) {
        console.log(formats[i]('[' + sev.toUpperCase() + ']') + ' ' + str);
    }
});

module.exports = logger;