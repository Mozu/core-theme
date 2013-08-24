/**
 * @class Taco.view.image.UploadModal
 */
    Ext.define('Taco.view.image.UploadModal', {
        extend: 'Taco.core.ux.modal.Content',
        title: 'Column Divider',
        autoShow: true,
        autoSize: true,
        requires: ['Taco.view.image.Uploader'],
        intentCls: 'myintent',

        items: [{
            xtype: 'imageuploader',
            //  recordId: 1,
            model: 'Taco.model.Product',
            type: 'product'
        }],
        //hack
        attemptCompleteEdit: function () {
            this.onSaveData();
            this.hide();
        },
        onSaveData: function () {
            var me = this,
                uploader = me.down('imageuploader');
            if (uploader.uploadRequests.items && uploader.uploadRequests.items.length > 0) {
                var path = '/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getSiteGroupId() + '/' +  uploader.uploadRequests.items[0].docId;

                if (me.createData) {

                    me.createData.document = {
                        items: []
                    };
                    me.createData.document.items.push({
                        key: "image_url",
                        value: '{"src":"' + path + '"}'
                    });
                }

                me.fireEvent('complete', {
                    src: path,
                    alt: "I am some alt text and such"
                },

                me.metaData, me);

                if (me.editableElement && me.editableElement.dom) {
                    me.editableElement.dom.setAttribute('src', path);
                }
            }
        },
        initComponent: function () {
            var me = this;
            me.callParent(arguments);

            var uploader = me.down('imageuploader');

            uploader.on({
                save: function () {
                    me.onSaveData();
                    me.hide();
                },
                close: function () {
                    me.hide();
                }
            });
        }
    });
