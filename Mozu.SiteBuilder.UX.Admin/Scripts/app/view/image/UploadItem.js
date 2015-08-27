/**
 * @class Taco.view.image.UploadItem
 */
    Ext.define('Taco.view.image.UploadItem', {
        extend: 'Ext.container.Container',
        alias: 'widget.uploaditem',
        padding: 5,
        border: true,
        cls: 'taco-uploading-images',
        file: null,
        uploadRequest: null,
        image: null,
        progressBar: null,
        intentCls: 'fleensupload',

        initComponent: function () {
            var me = this;

            me.image = Ext.create('Ext.Img', {
                cls: 'taco-uploading'
            });

            me.progressBar = Ext.create('Ext.ProgressBar', {
                animate: true
            });

            me.items = [
                me.image,
                me.progressBar
            ];

            me.on({
                afterrender: {
                    fn: me.onAfterRender,
                    scope: me
                }
            });

            me.callParent(arguments);
        },

        onAfterRender: function () {
            var me = this;

            me.image.getEl().dom.classList.add("obj");
            me.image.getEl().dom.file = me.file;

            var reader = new FileReader();

            reader.onload = function (e) {

                if (me.image) {
                    me.image.getEl().dom.src = e.target.result;

                    Taco.core.util.UploadManager.on({
                        progress: Ext.bind(me.onProgress, me)
                    });

                    Taco.core.util.UploadManager.on({
                        load: Ext.bind(me.onLoad, me)
                    });

                    Taco.core.util.UploadManager.on({
                        error: Ext.bind(me.onError, me)
                    });

                    me.uploadRequest.execute();
                }
            };

            // Display the thumbnail
            reader.readAsDataURL(me.file);

        },

        onProgress: function (e) {
            var me = this;

            if (e.id == me.uploadRequest.id) {
                if (me.progressBar) {
                    me.progressBar.updateProgress(e.percentUploaded);
                }
            }
        },

        onLoad: function (e) {
            var me = this;

            if (e.id == me.uploadRequest.id) {
                if (me.image && me.progressBar) {
                    me.progressBar.getEl().fadeOut({ duration: 600 });
                    me.image.addCls('taco-complete').removeCls('taco-uploading');
                    Ext.defer(function () {
                        if (me.image) {
                            me.image.addCls('taco-complete-fade');
                        }
                    }, 1500);
                }
            }
        },

        onError: function (e) {
            var me = this;

            if (e.id == me.uploadRequest.id) {
                console.log("TODO: implement error handling.");
            }
        }

        // TODO: This was for testing. We should remove this
//        destroy: function () {
//            var me = this;
//            Ext.destroyMembers(me, 'image', 'progressBar');
//            this.callParent(arguments);
//        }
    });
