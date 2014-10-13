/**
* @class Taco.core.util.UploadManager
* @requires Taco.core.util.FileUploadEvent
* @mixins Ext.util.Observable
*/

Ext.define('Taco.core.util.UploadManager', function () {

    // Private members

    var id = 0;

    var getNextId = function () {
        id = id + 1;
        return id;
    };

    var logMessage = function (msg, timeStamp) {
        console.log("[" + Ext.Date.format(new Date(timeStamp), 'D M d Y H:i:s:u \\G\\M\\TO') + "] " + msg);
    };

    return {
        requires: ['Taco.core.util.FileUploadEvent'],
        singleton: true,
        mixins: {
            observable: 'Ext.util.Observable'
        },

        constructor: function (config) {
            var me = this;

            me.mixins.observable.constructor.call(this, config);

            me.uploadRequests = new Ext.util.MixedCollection();

            me.addEvents(
            /**
            * @event
            * Triggered when the upload starts.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'loadstart',
            /**
            * @event
            * Triggered when XHR signals progress.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'progress',
            /**
            * @event
            * Triggered when XHR loads the file.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'load',
            /**
            * @event
            * Triggered when the upload errors.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'uploaderror',
            /**
            * @event
            * Triggered when the upload completes.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'complete',
            /**
            * @event
            * Triggered to notify a save failure.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'modelsavefailure',
            /**
            * @event
            * Triggered to notify a successful save.
            * @param event {Taco.core.util.FileUploadEvent}
            */
                'modelsavesuccess');

            // Debug
            me.on({
                loadstart: function (e) {
                    logMessage("[FILE START] Upload for transaction " + e.id + " started.", e.timeStamp);
                },

                progress: function (e) {
                    console.log(e);
                    logMessage("[FILE PROGRESS] Upload progress updated for transaction " + e.id + ". Percent complete: " + (e.percentUploaded * 100) + "%", e.timeStamp);
                },

                load: function (e) {
                    logMessage("[FILE LOAD] Upload for transaction " + e.id + " completed.", e.timeStamp);
                },

                uploaderror: function (e) {
                    logMessage("[FILE ERROR] Upload for transaction " + e.id + " failed.", e.timeStamp);
                },

                complete: function (e) {
                    logMessage("[TRANSACTION COMPLETE] Transaction " + e.id + " completed. Document ID: " + e.docId, e.timeStamp);
                }
            });

            this.callParent(arguments);
            me.on({
                loadstart: me.updateuploadRequests,
                progress: me.updateuploadRequests,
                load: me.updateuploadRequests,
                uploaderror: me.updateuploadRequests,
                complete: me.updateuploadRequests,
                scope: me
            });

        },

        requestUpload: function (config) {
            var me = this,
                document = config.document,
                file = config.file,
                url = config.url,
                tid = getNextId(),
                xhr = new XMLHttpRequest(),
                ur;

            xhr.upload.addEventListener("loadstart", Ext.bind(me.onLoadStart, me, [{
                id: tid,
                file: file,
                document: document
            }], true), false);

            xhr.upload.addEventListener("progress", Ext.bind(me.onProgress, me, [{
                id: tid,
                file: file,
                document: document
            }], true), false);

            xhr.upload.addEventListener("load", Ext.bind(me.onLoad, me, [{
                id: tid,
                file: file,
                document: document
            }], true), false);

            xhr.upload.addEventListener("error", Ext.bind(me.onUploadError, me, [{
                id: tid,
                file: file,
                document: document
            }], true), false);


            ur = {
                id: tid,
                execute: function () {

                    // Step 1: create the CMS document
                    document.save({
                        success: function (se) {
                            var options = {};
                            Taco.app.context.onBeforeAjaxRequest( null, options);
                           
                            console.log("Document ID: " + document.getId() + " created for file " + file.name);
                            me.fireEvent('modelsavesuccess', { document: document, file: file });
                            // Step 2: upload the image.
                            xhr.open("POST", url.replace("{docid}", document.getId()));
                            xhr.responseType = 'text';

                            Ext.Object.each(options.headers, function (key, value) {
                                xhr.setRequestHeader(key, value);
                            });
                                
                           

                            xhr.onload = function (e) {

                                // Step 3: signal completion
                                me.onComplete(e, {
                                    docId: document.getId(),
                                    id: tid,
                                    document: document
                                });
                            };

                            var formData = new FormData();
                            formData.append(file.name, file);
                            xhr.send(formData);
                        },

                        failure: function () {
                            console.log("Document ID: " + document.id + " creation failed for file " + file.name);
                            me.fireEvent('modelsavefailure', { document: document, file: file });
                        }
                    });
                }
            };
            
            me.uploadRequests.add(ur.id, {
                completed: false,
                request: ur,
                document: document,
                lastEvent: null
            });
            return ur;
        },

        updateuploadRequests: function (e) {
            var item = this.uploadRequests.getByKey(e.id);
            item.lastEvent = e;
            item.completed = e.type == 'complete';
        },

        // Make these private?
        onLoadStart: function (e, eventData) {
            var me = this;

            me.fireEvent('loadstart', Ext.apply(Ext.create('Taco.core.util.FileUploadEvent'), Ext.apply(eventData, {
                type: 'loadstart',
                timeStamp: e.timeStamp
            })));
        },

        /**
        * Handler for upload progress
        */
        onProgress: function (e, eventData) {
            var me = this,
                percentUploaded = (e.loaded / e.total).toFixed(2);
            eventData.document.set('progress', percentUploaded);
            
            me.fireEvent('progress', Ext.apply(Ext.create('Taco.core.util.FileUploadEvent'), Ext.apply(eventData, {
                type: 'progress',
                timeStamp: e.timeStamp,
                percentUploaded: percentUploaded
            })));
        },

        /**
        * Handler for when the upload ???
        */
        onLoad: function (e, eventData) {
            var me = this;

            me.fireEvent('load', Ext.apply(Ext.create('Taco.core.util.FileUploadEvent'), Ext.apply(eventData, {
                type: 'load',
                timeStamp: e.timeStamp
            })));
        },

        /**
        * Handler for when the upload errors
        */
        onUploadError: function (e, eventData) {
            var me = this;

           
            me.fireEvent('uploaderror', Ext.apply(Ext.create('Taco.core.util.FileUploadEvent'), Ext.apply(eventData, {
                type: 'uploaderror',
                timeStamp: e.timeStamp
            })));
        },

        /**
        * Handler for when the upload completes
        */
        onComplete: function (e, eventData) {
            var me = this;

            function updateDoc (doc) {
                doc.set('isUploaded', true);
                doc.set('fileSize', doc.raw.file.size);
                doc.commit();
            };

            updateDoc(eventData.document);
            me.fireEvent('complete', Ext.apply(Ext.create('Taco.core.util.FileUploadEvent'), Ext.apply(eventData, {
                type: 'complete',
                timeStamp: e.timeStamp
            })));
        }
    };
});
