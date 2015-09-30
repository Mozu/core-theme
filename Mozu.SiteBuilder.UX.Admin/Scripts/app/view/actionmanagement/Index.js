
Ext.define('Taco.view.actionmanagement.Index', {
    extend: 'Taco.core.ux.form.FullEditor',

    requires: [
        'Ext.form.Panel',
        'Taco.core.ux.form.field.Code'
    ],
    title: 'Action Management',
    formCls: 'Taco.core.ux.form.Form',
    enableNavHeader: true,
    autoTitle: true,
    autoScroll: true,
    initComponent: function () {

        var me = this,
            labels = {};

        this.formCfg = {
            flex: 1,
            layout: 'fit',
            title: this.title,
            items: [{
                xtype: 'taco-codefield',
                itemId: 'configfield',
                name: 'expression',
                fontSize: '12px',
                height: 600,
                resizable: false,
                showGutter: true,
                selectOnRender: false,
                mode: 'json',
                theme: 'ace/theme/monokai'
            }]
        };
        
        this.callParent(arguments);

        me.configField = me.down('#configfield');

        me.on('afterrender', function () {
            Ext.defer(function() {
                me.resizeEditor();
            }, 10);
        });

        me.on('resize', function() {
            me.resizeEditor();
        });

        me.initEditor();
    },

    resizeEditor: function() {
        this.configField.setHeight(this.body.getHeight() - 50);
    },

    initEditor: function () {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/actionconfiguration/read',
            success: function (response) {
                var data = Ext.JSON.decode(response.responseText).items;
                if (JSON && JSON.stringify) {
                    data = JSON.stringify(data, null, '\t');
                } else {
                    data = (data) ? Ext.JSON.encode(data) : null;
                }
                
                me.configField.setValue(data);
            },
            failure: function (response) {
                Taco.app.fireEvent('setmessage', 'An error occured while retrieving the configuration', 'error');
            }
        });
    },

    doSave: function () {
        var me = this;
        var data;

        try {
            data = Ext.JSON.decode(me.configField.getValue(), false);
        } catch (e) {
            Taco.app.fireEvent('setmessage', 'The JSON you are attempting to save is not in a valid format', 'error');
            me.saveFailure();
            return;
        }

        Ext.Ajax.request({
            url: '/admin/app/actionconfiguration/update',
            method: 'POST',
            jsonData: data,
            success: function (response) {
                me.saveSuccess(response);
            },
            failure: function (response) {
                var msg = 'An error occured while saving your configuration. Please ensure that it is formatted correctly.';
                var oRes = Ext.JSON.decode(response.responseText)
                if (oRes.message)
                {
                    msg = oRes.message;
                }
                if (oRes.items && oRes.items.length) {
                    msg = oRes.items[0].message;
                }

                Taco.app.fireEvent('setmessage', msg, 'error');
                me.saveFailure();
            }
        });
    }
});