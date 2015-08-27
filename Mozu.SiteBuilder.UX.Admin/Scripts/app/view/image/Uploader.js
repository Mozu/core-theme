///**
// * @class Taco.view.image.Uploader
// */

// deprecated

//    Ext.define('Taco.view.image.Uploader', {
//        extend: 'Taco.core.ux.form.Editor',
//        alias: 'widget.imageuploader',
//        requires: ['Taco.core.ux.DragDropZone', 'Taco.view.image.UploadItem', 'Taco.model.ProductImageDocument'],
//        title: 'Upload images',
//        dropZone: undefined,
//        displayArea: undefined,
//        uploadRequests: undefined,

//        initComponent: function () {
//            var me = this;

//            me.uploadRequests = new Ext.util.MixedCollection();

//            Taco.core.util.UploadManager.on({
//                complete: me.onDocumentComplete,
//                scope: me
//            });

//            me.actions = [{
//                xtype: 'secondarybutton',
//                text: 'Cancel',
//                listeners: {
//                    click: {
//                        fn: this.close,
//                        scope: this
//                    }
//                }
//            }, {
//                xtype: 'primarybutton',
//                text: 'Save',
//                listeners: {
//                    click: {
//                        fn: this.save,
//                        scope: this
//                    }
//                }
//            }];

//            me.displayArea = Ext.create('Ext.container.Container', {
//                cls: 'taco-upload-preview',
//                border: true,
//                width: 600
//            });

//            me.dropZone = Ext.create('Taco.core.ux.DragDropZone', {
//                width: 600,
//                listeners: {
//                    filedrop: me.handleFiles,
//                    scope: me
//                }
//            });

//            me.tabs = [{
//                title: 'From computer',
//                items: [me.dropZone, me.displayArea]
//            }, {
//                title: 'Image library',
//                items: [Ext.create('Taco.core.ux.DragDropZone')]
//            }];

//            me.callParent(arguments);
//        },

//        // We don't need the editor to do any saving stuff for us
//        save: function () {
//            var me = this;
//            me.fireEvent('save');
//        },

//        handleFiles: function (files) {
//            var me = this;

//            Ext.each(files, function (file) {
//                var imageType = /image.*/;

//                if (file.type.match(imageType)) {

//                    var uploadRequest = Taco.core.util.UploadManager.requestUpload({
//                        document: Ext.create('Taco.model.ProductImageDocument', {
//                            fileName: file.name,
//                            altText: 'Alt text goes here',
//                            caption: 'I am a product image caption'
//                        }),
//                        file: file,
//                        url: '/admin/app/image/{docid}/create'
//                    });

//                    // Add this request to the collection so we can monitor it
//                    me.uploadRequests.add(uploadRequest.id, {
//                        completed: false,
//                        request: uploadRequest
//                    });

//                    me.displayArea.add(Ext.create('Taco.view.image.UploadItem', {
//                        file: file,
//                        uploadRequest: uploadRequest
//                    }));
//                }
//            });
//        },

//        onDocumentComplete: function (e) {
//            var me = this;
//            var request = me.uploadRequests.get(e.id);

//            if (request) {
//                request.completed = true;
//                request.docId = e.docId;
//                console.log("Uploader detected completion for transaction " + e.id);
//            }
//        }
//    });
