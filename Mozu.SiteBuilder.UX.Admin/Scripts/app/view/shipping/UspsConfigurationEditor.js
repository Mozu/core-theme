/**
 * @class Taco.view.shipping.UspsConfigurationEditor
 */
Ext.define('Taco.view.shipping.UspsConfigurationEditor', {
    alias: 'widget.uspsconfigeditor',
    extend: 'Ext.form.Panel',
    requires: ['Taco.model.UspsConfiguration'],
    border: false,
    mixins: {
        field: 'Ext.form.field.Field'
    },

    initComponent: function () {
        var me = this;

        me.UspsDomesticRates = Ext.create('Ext.grid.Panel', {
            height: 500,
            width: 500,
            selModel: Ext.create('Ext.selection.CheckboxModel', {
                checkOnly: true,
                listeners: {
                    selectionchange: me.onSelectionChange,
                    scope: me
                }
            }),
            store: Ext.create('Taco.store.UspsSharedShippingMethods', {
                autoLoad: true,
                filters: new Ext.util.Filter({
                    property: 'isinternational',
                    value: false
                }),
                listeners: {
                    load: function () {
                        me.loadSelectedUspsRates(me.UspsDomesticRates);
                    }
                }
            }),
            columns: [{
                header: 'Code',
                dataIndex: 'code',
                flex: 1
            }]
        });

        me.UspsIntlRates = Ext.create('Ext.grid.Panel', {
            height: 500,
            width: 500,
            selModel: Ext.create('Ext.selection.CheckboxModel', {
                checkOnly: true,
                listeners: {
                    selectionchange: me.onSelectionChange,
                    scope: me
                }
            }),
            store: Ext.create('Taco.store.UspsSharedShippingMethods', {
                autoLoad: true,
                filters: new Ext.util.Filter({
                    property: 'isinternational',
                    value: true
                }),
                listeners: {
                    load: function () {
                        me.loadSelectedUspsRates(me.UspsIntlRates);
                    }
                }
            }),
            columns: [{
                header: 'Code',
                dataIndex: 'code',
                flex: 1
            }]
        });

        me.domesticLabel = Ext.create('Ext.Component', {
            html: '<em>Domestic (United States)</em>'
        });

        me.internationalLabel = Ext.create('Ext.Component', {
            html: '<em>International</em>',
            padding: '20 0 0 0'
        });

        me.uspsAccountLabel = Ext.create('Ext.Component', {
            html: 'If you don\'t have a USPS id you may create one <a>here</a>',
            padding: '0 0 20 0'
        });

        me.items = [{
            xtype: 'textfield',
            name: 'uspsUserId',
            labelAlign: 'top',
            width: 250,
            fieldLabel: 'USPS Live ID',
            isDirty: function () {
                return false;
            }
        },
        me.uspsAccountLabel,
        me.domesticLabel,
        me.UspsDomesticRates,
        me.internationalLabel,
        me.UspsIntlRates];

        me.callParent(arguments);
    },

    toggleInternationalRates: function (show) {
        var me = this;

        me.UspsIntlRates.setVisible(show);
        me.internationalLabel.setVisible(show);

        if (!show) {
            me.UspsIntlRates.getSelectionModel().deselectAll();
        }
    },

    loadSelectedUspsRates: function (grid) {
        var me = this;
        var record = me.getForm().getRecord();

        if (record) {
            var store = grid.getStore();
            var selections = me.getForm().getRecord().get("shippingMethods");
            var methods = new Array();

            Ext.Array.each(selections, function (methodId, index, list) {
                var m = store.getById(methodId);
                if (m) {
                    methods.push(m);
                }
            });

            if (methods.length > 0) {
                grid.getSelectionModel().select(methods, true, true);
            }
        } else {
            // Gross
            console.log('No record present!!!!');

            Ext.Function.defer(function () {
                me.loadSelectedUspsRates(grid);
            }, 100);
        }
    },

    onSelectionChange: function (model, records) {
        var me = this;
        var domestic = me.UspsDomesticRates.getSelectionModel().getSelection();
        var international = me.UspsIntlRates.getSelectionModel().getSelection();

        var d = new Array();
        Ext.Array.each(domestic, function (method, index, list) {
            d.push(method.get("code"));
        });

        var i = new Array();
        Ext.Array.each(international, function (method, index, list) {
            d.push(method.get("code"));
        });

        me.getForm().getRecord().set("shippingMethods", Ext.Array.union(d, i));
        this.fireEvent('dirtychange', me);
    },

    isDirty: function () {
        var me = this;
        if (me.getForm().getRecord()) {
            return me.getForm().getRecord().dirty;
        } else {
            return false;
        }

    }
});