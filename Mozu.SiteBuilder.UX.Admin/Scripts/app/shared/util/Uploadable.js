/**
 * @class Taco.shared.util.Uploadable
 * @author  Jason *The Cock* Cochran
 */
Ext.define('Taco.shared.util.Uploadable', {
    requires: ['Taco.core.ux.modal.Alert'],

    onUploadFile: function (fileList, e, callback) {
        var me = this,
            imageType = /image.*/,
            shouldBreak = false,
            newDocs = [],
            files = [];

        Ext.each(fileList, function (file) { files.push(file); });
        Ext.each(files, function (file) {
            var fileRecord,
                fileRecordIdx = me.store ? me.store.find('name', file.name) : -1;
            if (fileRecordIdx > -1) {
                fileRecord = me.store.getAt(fileRecordIdx);
                Ext.create('Taco.core.ux.modal.Alert', {
                    autoShow: true,
                    text: '<div style="text-align:center"> File:  "<i>' + file.name + '</i>" already exists<br/></div>',

                    listeners: {
                        confirm: function () {
                            Ext.Array.remove(files, file);
                            this.fireEvent('existingfile', [fileRecord]);
                            if (files.length > 0) {
                                Ext.defer(function () {
                                    me.onUploadFile(files);
                                }, 100);

                            }
                        },
                        scope: me
                    }
                });
                shouldBreak = true;
                return false;

            }
        });

        if (shouldBreak) {
            return;
        }

        Ext.each(files, function (file) {
            var reader, doc, uploadRequest;

            reader = new FileReader();

            doc = Ext.create('Taco.shared.model.File', {
                name: file.name,
                fileType: file.type,
                isUploaded: false,
                thumbnail: '/admin/Scripts/resources/images/file-icon.png',
                file: file
            });



            reader.onload = function (e) {
                var img;

                if (file.type.match(imageType)) {
                    doc.set('fileType', 'image');
                    doc.set('localthumbnail', e.target.result);
                    img = new Image();
                    img.onload = function () {
                        doc.set('width', img.width);
                        doc.set('height', img.height);
                        uploadRequest.execute();
                    };
                    img.src = e.target.result;
                }
                else {
                    uploadRequest.execute();
                }
            };
            reader.readAsDataURL(file);

            uploadRequest = Taco.core.util.UploadManager.requestUpload({
                document: doc,
                file: file,
                url: '/admin/app/fileManagement/file/upload/{docid}'
            });

            newDocs.push(doc);


        });
        if (newDocs.length > 0) {
            if (me.store) {
                me.store.insert(0, newDocs);
            }
            if (callback && Ext.isFunction(callback)) {
                callback(newDocs);
            }

            this.fireEvent('beginupload', newDocs);
        }
    }
});
 