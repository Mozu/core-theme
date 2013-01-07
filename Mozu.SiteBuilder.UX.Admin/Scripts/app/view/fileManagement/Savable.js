/**
 * @class Taco.view.fileManagement.Savable
 */
Ext.define('Taco.view.fileManagement.Savable', {
    requires: ['Taco.core.ux.modal.Alert', 'Taco.model.FileManagementFile'],
    onSaveFiles: function (fileList, e, callback) {
        var me = this,
            foldertree = me.foldertree || me.down('foldertree'),
            folderId = foldertree.getSelectedNode().getId(),
            imageType = /image.*/,
            shouldBreak = false,
            newDocs = [],
            files = [],
            folderRecord = null,
            target = null;

        if (e && e.getTarget) {
            target = e.getTarget('.x-grid-row');
        }

        if (target) {
            folderRecord = foldertree.getView().getRecord(target);
            if (folderRecord) {
                folderId = folderRecord.getId();
                foldertree.getSelectionModel().select([folderRecord]);
            }
        }
        Ext.each(fileList, function (file) { files.push(file); });
        Ext.each(files, function (file) {
            if (me.filesStore.find('name', file.name) > -1) {

                Ext.create('Taco.core.ux.modal.Alert', {
                    autoShow: true,
                    text: '<div style="text-align:center"> File:  "<i>' + file.name + '</i>" already exists<br/> and will be ignored</div>',

                    listeners: {
                        confirm: function () {
                            Ext.Array.remove(files, file);
                            me.onSaveFiles(files);
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

            doc = Ext.create('Taco.model.FileManagementFile', {
                name: file.name,
                fileType: file.type,
                isUploaded: false,
                folderId: folderId,
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
                url: '/admin/app/fileMangment/file/upload/{docid}'
            });

            newDocs.push(doc);


        });
        if (newDocs.length > 0) {
            me.filesStore.insert(0, newDocs);
            if (callback && Ext.isFunction(callback)) {
                callback(newDocs);
            }
        }
    }
});
 