/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingProvider', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.Countries'],
    title: 'base Provider',
    layout: {
        type: 'card',
        manageOverflow: 2,
        reserveScrollbar: true
    },
    providerId: 'fedex',
    configureCopy: 'lorum jip',
    ratesCopy: 'blu blue blee',
    customFileds: [],
    padding: '10 10 10 10',
    initComponent: function () {
        var me = this;
        //p.getLayout().setActiveItem(1);


        this.configFields = Ext.widget({
            xtype: 'formform',
            autoScroll: true,

            width: 400,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: me.customFileds

        });
        this.configFields.getForm().setValues(this.record.get("settings") || {});

        this.configContainer = Ext.widget({
            xtype: 'container',
            autoScroll: true,
            layout: {
                type: 'hbox'
            },
                items: [
                {
                    xtype:'container',
                                    items: [].concat(this.configFields, [{
                                xtype: 'checkbox',  name: 'enabled', boxLabel: 'enabled'}])
                }
               ,
                {
                    xtype: 'container',
                    padding: '40 40 40 40',

                        items: [
                            
                        {
                            height: 400,
                            width: 240,
                            html: me.configureCopy
                        }
                       
                    ]
                }
            ]
        });


        this.items = [
            this.configContainer
        ];

        this.callParent(arguments);

    },
    beforeSave: function () {
        if (this.configFields.isDirty()) {
            var settings = this.configFields.getForm().getValues(false, false, false, true);
            this.record.set('settings', settings);

        }
    }

});