/**
 * The IP Blocking editor view
 */

Ext.define('Taco.view.ipblocking.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.window.Modal'
    ],
    ui: 'subform',
    createTitle: 'IP Blocking',
    layout: {
        type: 'vbox',
        align: 'left'
    },

    initComponent: function () {

        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.IpBlocking');

        this.store.load({callback: this.installRecord, scope: this});

        this.buildFormComponents();

        this.callParent(arguments);
    },

    installRecord: function(records) {
        var ip = records[0].get('ipAddress'),
            downloadDate = records[0].get('downloadDate') ? Ext.Date.format(records[0].get('downloadDate'), 'M d Y g:ia') : 'You have not uploaded a file yet. You can download a sample file by clicking the download button.';

        this.record = records[0];
        this.loadRecord(this.record);
        this.down('#ip-address').update('Your IP address is: <strong>' + ip + '</strong>');
        this.down('#download-date').update('<strong>Date uploaded: </strong>' + downloadDate);
    },

    downloadFile: function() {
        this.record.doExport();
    },

    buildFormComponents: function() {

        var header, explanation, formField, uploadGroup, downloadGroup, _this = this;

        var me = this;

        header = {
            xtype: 'component',
            margin: '20 0 0 0',
            html: 'Your IP address is',
            id: 'ip-address'
        };

        explanation = {
            xtype: 'component',
            margin: '20 0 0 0',
            html: 'Upload the .CSV file containing the rules you would like to apply to your website.'
        };

        formField = {
            xtype: 'fieldcontainer',
            defaultType: 'checkboxfield',
            margin: '20 0 0 0',
            width: '100%',
            items: [
                {
                    boxLabel  : 'Enabling this setting will block all IP addresses from accessing both your Mozu Storefront and administration area. This setting must be enabled for IP security rules to take affect.',
                    fieldLabel: 'Enable IP Address Security Rules',
                    labelAlign: 'top',
                    name: 'enabled'
                }
            ]
        };

        uploadGroup = {
            xtype: 'container',
            margin: '20 0 0 0',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'tacofilefield',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Upload File',
                    id: 'fileUpload',
                    listeners: {
                        filechange: function (fileList, e) {
                            _this.record.onUploadFile(fileList, e, _this);
                        },
                        boxready: function(cmp) {
                            cmp.fileInputEl.set({ multiple: 'single', accept: '.csv' });
                        }
                    }
                },
                {
                    xtype: 'component',
                    margin: '8 0 0 10',
                    id: 'download-date'
                }
            ]
        };

        downloadGroup = {
            xtype: 'container',
            layout: {
                type: 'hbox'
            },
            margin: '20 0 0 0',
            items: [
                {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Download',
                    width: 117,
                    handler: this.downloadFile.bind(this)
                }
            ]
        };

        this.items = [
            header,
            explanation,
            formField,
            uploadGroup,
            downloadGroup
        ];
    }
});