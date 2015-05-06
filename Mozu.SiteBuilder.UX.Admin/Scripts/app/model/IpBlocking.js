
Ext.define('Taco.model.IpBlocking', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            name: 'enabled',
            type: 'boolean',
            usenull: false
        },
        {
            name: 'downloadDate',
            type: 'date'
        },
        {
            name: 'ipAddress',
            type: 'string'
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/ipblocking/read',
            update: '/admin/app/ipblocking/update'
        },
        reader: {
            type: 'json',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },

    doExport: function (config) {
        window.location.href = '/admin/app/ipblocking/export';
    },

    onUploadFile: function(fileList, e, scope) {
        if (scope.record.get('downloadDate')) {
            this.getRevertModal(fileList, e, scope);
        }
        else {
            this.uploadFile(fileList, e);
        }
    },

    uploadFile: function (fileList, e) {
        var me = this,
            files = [];

        Ext.each(fileList, function (file) { files.push(file); });

        Ext.each(files, function (file) {
            var reader = new FileReader();

            reader.onload = function (e) {

                Ext.Ajax.request({
                    url: "/admin/app/ipblocking/import",
                    method: 'post',
                    jsonData: e.target.result,
                    success: function (resp) {
                        Taco.app.fireEvent('setmessage', 'File Uploaded Successfully', 'info');   
                    },
                    failure: function (resp) {
                        var json = Ext.decode(resp.responseText, true),
                            msg = (json && json.message) ? json.message : "Error uploading file";

                        Taco.app.fireEvent('setmessage', msg, 'error');
                    }
                });

            };

            reader.readAsText(file);
        });

    },
    clearFile: function() {
        this.down('#fileUpload').reset();
        this.down('#fileUpload').fileInputEl.set({ multiple: 'single', accept: '.csv' });
    },
    getRevertModal: function(fileList, e, el) {

        var me = this;
        
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: 'Overwrite Existing File?',
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: 'Ok',
            secondaryText: 'Cancel',
            primaryHandler: function() {
                me.uploadFile(fileList, e);
                me.clearFile.call(el);
                this.close();
            },
            secondaryHandler: function() {
                me.clearFile.call(el);
                this.close();
            },
            items: [{
                xtype: 'container',
                layout: { 
                    type: 'hbox' 
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: 'You are about to overwrite your previously uploaded file. Click OK to continue.'
                    })
                ]
            }]
        }).show();

    },
});