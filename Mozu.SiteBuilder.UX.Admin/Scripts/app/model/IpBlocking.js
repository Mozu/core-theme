
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

    export: function (config) {
        window.location.href = '/admin/app/ipblocking/export';
    },

    onUploadFile: function (fileList, e) {
        var me = this,
            files = [];

        Ext.each(fileList, function (file) { files.push(file); });

        Ext.each(files, function (file) {
            var reader;

            reader = new FileReader();

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

    }
});