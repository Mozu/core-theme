



Ext.define('Taco.view.customerset.DeleteModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.grid.Panel',
        'Ext.selection.CheckboxModel'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Delete',
    title: 'Delete Customer Set',

    initComponent: function() {

        var me = this;
        var defaultCs = me.store.findRecord('isDefault', true);
        var data = me.store.data.items
            .filter(function(x) {
                return x.raw.code !== me.record.raw.code;
            }).map(function(x) {
            return [x.raw.code, x.raw.name];
        });
        me.customerSetCb = Ext.create('Taco.core.ux.form.SelectField', {
            fieldLabel: 'Customer Set',
            store: data,
            value: defaultCs ? defaultCs.getId() : undefined,
            queryMode: 'local',
            allowBlank: false
        }); // 'Taco.store.CustomerSet'
        me.record.raw.aggregateInfo = me.record.raw.aggregateInfo || {};
        me.items = [
            {
                xtype: 'box',
                html: me.record.get('name') + ' is currently assigned to ' + me.record.raw.sites.length + ' Sites(s) and ' + me.record.raw.aggregateInfo.customerCount + ' Customer(s)'
            },
            {
                xtype: 'box',
                html: 'They will be reassigned to the following'
            },
            me.customerSetCb,
            {
                xtype: 'box',
                html: 'Are you sure you want to delete <b>' + me.record.get('name') + '</b>?'
            }
        ];

        me.callParent(arguments);
        if (!me.record.raw.sites.length && !me.record.raw.aggregateInfo.customerCount) {
            Ext.Function.defer(function() {
                me.doSave();
            }, 100);

        }
    },

    doSave: function() {
        var me = this;
        me.record.set('replacementCode', me.customerSetCb.getValue());
        me.record.destroy({
            callback: function(rec, opt) {
                var err = opt.getError();
                if (err) {
                    var message = err.remoteException ? err.remoteException.getError() : 'error occurred';
                    Taco.app.fireEvent('setmessage', message, 'error');
                }
                else {
                    me.saveSuccess();
                }

            }
        });

    }
})