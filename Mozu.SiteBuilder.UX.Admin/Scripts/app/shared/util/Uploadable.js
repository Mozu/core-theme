/**
 * @class Taco.shared.util.Uploadable
 * @author  Jason *The Cock* Cochran
 */
Ext.define('Taco.shared.util.Uploadable', {
    requires: ['Taco.core.ux.window.Alert'],

    onUploadFile: function (fileList, e, callback) {
        var me = this,
            imageType = /image.*/,
            shouldBreak = false,
            newDocs = [],
            files = [];

        if (me.validateFiles && !me.validateFiles(fileList)) {
            return;
        }

        Ext.each(fileList, function (file) { files.push(file); });
        Ext.each(files, function (file) {
            var fileRecordIdx = me.store ? me.store.find('name', file.name) : -1;
            if (fileRecordIdx > -1) {
                Ext.create('Taco.core.ux.window.Alert', {
                    autoShow: true,
                    html: '<div style="text-align:center"> File:  "<i>' + file.name + '</i>" already exists<br/></div>'
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
 