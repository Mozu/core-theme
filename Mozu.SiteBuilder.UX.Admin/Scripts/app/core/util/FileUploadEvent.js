/**
 * @class Taco.core.util.FileUploadEvent
 * Event object to use for passing around to file uploaders.
 */

Ext.define('Taco.core.util.FileUploadEvent', {
    id: null,
    file: null,
    timeStamp: null,
    type: '',
    percentUploaded: 0
});
