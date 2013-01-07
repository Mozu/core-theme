/**
* @author Travis Johnson
* @class Taco.view.product.edit.ProductProperties
*/


    Ext.define('Taco.view.product.edit.ProductProperties', {
        extend: 'Ext.container.Container',
        requires: ['Taco.core.ux.action.Action'],
        width: 600,
        product: null,
        store: null,
        layout: {
            type: 'vbox'
        },
        initComponent: function () {
            var me = this;

            me.header = Ext.create('Ext.container.Container', {
                layout: { type: 'hbox', align: 'stretch' },
                width: me.width,

                items: [
                {
                    xtype: 'component',
                    autoEl: 'b',
                    tpl: 'Properties (0)',
                    data: { count: 0 }
                },
                {
                    html: '&nbsp;',
                    flex: 1,
                    border: false
                },
                {

                    xtype: 'action',
                    text: '+ Use Existing',
                    click: function () { me.addProperty(true); }
                },
                {
                    xtype: 'action',
                    text: '+ Create New',
                    click: function () { me.addProperty(false); }
                }
                ]
            });
            me.body = Ext.create('Ext.container.Container', {

                width: me.width

            });


            me.items = [me.header, me.body];
            if (me.product.phantom)
            {
                me.hidden = true;
                product.on(
                {
                    idchanged: function () {
                        me.store = me.product.productOptions();
                    }
                });
            }
            else
            {
                me.store = me.product.productOptions();
            }


            me.callParent(arguments);
        },

        addProperty: function (useExisting) {

            var me = this;
            if (!me.store)
            {
                Ext.Msg.alert('Status', 'Save product to do stuff.');
                return;
            }
            oEdit = Ext.create('Taco.view.option.Edit', {
                autoComplete: useExisting,
                readOnly: useExisting,
                isModal: true,
                height: 500
            }),
            modal = Ext.create('Taco.core.ux.modal.Content', {
                autoShow: true,
                content: {
                    items: [oEdit]
                }

            });

            oEdit.on(
            {
                save: function () {

                    Ext.each(oEdit.getSelectedIds(), function (item) {
                        var mdm = Ext.create('Taco.model.ProductOptionValue');
                        mdm.set('productCode', me.product.getId());
                        mdm.set('option_id', oEdit.data.getId());
                        mdm.set('id', item);
                        mdm.set('forConfiguration', me.forConfiguration);
                        me.productOptionValueStore.add(mdm);
                    }, me);
                    me.productOptionValueStore.sync({
                        callback: function () {
                            me.productOptionValueStore.load();
                            modal.hide();
                        }
                    });

                },
                close: model.hide
            });
        }
    });
