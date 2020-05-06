/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingProvider', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.Countries',
        'Taco.core.ux.content.Tooltip'
    ],
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

        var key = 'shippingForReturns' + this.record.get('id');
        var isEnabled = this.record.get('enabledForReturns');


        this.on('beforeShow', function() {
            this.tooltip = Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: key,
                hoverTarget: 'boxLabelEl',
                messageKey: 'shipping.enableForReturns',
                offsetLeft: -5,
                offsetTop: 90,
                delay: 100
            })
        })

        this.configFields.getForm().setValues(this.record.get("settings") || {});

        var enableForReturns = this.record.get('id') === 'fedex' 
            || this.record.get('id') === 'usps';

        var optionItems = [].concat(
            this.configFields, 
            [
                {
                    xtype: 'checkbox',  
                    name: 'enabled', 
                    boxLabel: 'Enable for Checkout'
                }
            ]
        );

        if (enableForReturns) {
            optionItems.push({
                xtype: 'checkbox',  
                name: 'enabledForReturns', 
                boxLabel: 'Enable for Returns',
                itemId: key,
                listeners: {
                    change: function(cmp) {
                        var checked = cmp.checked;
                        var form = me.down('#returnForm');
                        if (form) {
                            form[checked ? 'show' : 'hide']();
                        }
                    }
                }
            });
        }
        this.configContainer = Ext.widget({
            xtype: 'formform',
            autoScroll: true,
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype:'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'container',
                            items: optionItems
                        },
                        {
                            xtype: 'container',
                            items: [        
                                {
                                    height: 350,
                                    width: 240,
                                    html: me.configureCopy
                                }
                            ]
                        }
                    ]
                },
                this.returnItems
            ]
        });

        this.items = [
            this.configContainer
        ];

        this.callParent(arguments);

    },

    beforeSave: function () {
        if (this.configFields.isDirty() || this.configContainer.isDirty()) {
            var settings=this.configFields.getForm().getValues(false, false, false, true);
            
                if (settings[Object.keys(settings)[0]] === "0" && this.customFileds[0].record) {
                    this.deleteCarrierCredentials();
                }
                else if (this.customFileds[0].record && settings[Object.keys(settings)[0]]!="0") {

                    this.updateCarrierCredentials();
                }
                else if (!this.customFileds[0].record && settings[Object.keys(settings)[0]] != "0") {
                    this.insertCarrierCredentials();
                }
                
          //  }

            // TODO Need to remove this code.
            //if (this.returnItems) {
            //    var returnSettings = this.returnItems.getForm().getValues(false, false, false, true);
            //    if (settings != undefined && settings != null) {
            //        delete settings[Object.keys(settings)[0]];
            //    }
            //    settings = Ext.apply(settings, returnSettings);
            //    issettingSet = true;
            //}
           
            //if (issettingSet) {
            //    this.record.set('settings', settings);
            //}

        }
    },

    getCarrierCredentialModel: function () {
        var me = this;
        
        var selectedRecord = this.configFields.getForm().getValues(false, false, false, true);
        var carrierId = this.providerId.toLowerCase();
        var siteId = Taco.app.context.getSiteId();
        var model = {
            carrierId: carrierId,
            siteId: siteId,
            CredentialSet: {
                code: selectedRecord[Object.keys(selectedRecord)[0]]
            }
        }
        return model;

    },
    insertCarrierCredentials: function () {
        me = this;
        if (this.configFields.isDirty() || this.configContainer.isDirty()) {
           var model = this.getCarrierCredentialModel();

            try {
                data = Ext.JSON.encode(model);
            } catch (e) {
                Taco.app.fireEvent('setmessage', 'The JSON you are attempting to save is not in a valid format', 'error');
                return;
            }

            Ext.Ajax.request({
                url: '/admin/app/carriers/credentials/create',
                method: 'POST',
                jsonData: data,
                success: function () {
                    Taco.app.fireEvent('savesuccess', this);                },
                failure: function (response) {
                    var msg = 'An error occured while saving your configuration. Please ensure that it is formatted correctly.';
                    var oRes = Ext.JSON.decode(response.responseText);
                    if (oRes.message) {
                        msg = oRes.message;
                    }
                    if (oRes.items && oRes.items.length) {
                        msg = oRes.items[0].message;
                    }

                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            });
        }
    },

    updateCarrierCredentials: function () {
        me = this;
        if (this.configFields.isDirty() || this.configContainer.isDirty()) {
            var model = this.getCarrierCredentialModel();

            try {
                data = Ext.JSON.encode(model);
            } catch (e) {
                Taco.app.fireEvent('setmessage', 'The JSON you are attempting to save is not in a valid format', 'error');
                return;
            }

            Ext.Ajax.request({
                url: '/admin/app/carriers/credentials/update',
                method: 'POST',
                jsonData: data,
                success: function () {
                    Taco.app.fireEvent('savesuccess', this);
                },
                failure: function (response) {
                    var msg = 'An error occured while saving your configuration. Please ensure that it is formatted correctly.';
                    var oRes = Ext.JSON.decode(response.responseText);
                    if (oRes.message) {
                        msg = oRes.message;
                    }
                    if (oRes.items && oRes.items.length) {
                        msg = oRes.items[0].message;
                    }
                    Taco.app.fireEvent('setmessage', msg, 'error');

                }
            });
        }


    },

     deleteCarrierCredentials: function () {
        me = this;
        if (this.configFields.isDirty() || this.configContainer.isDirty()) {
            // var settings = this.configFields.getForm().getValues(false, false, false, true);

            var model = this.getCarrierCredentialModel();

            try {
                data = Ext.JSON.encode(model);
            } catch (e) {
                Taco.app.fireEvent('setmessage', 'The JSON you are attempting to save is not in a valid format', 'error');
                return;
            }

            Ext.Ajax.request({
                url: '/admin/app/carriers/credentials/delete',
                method: 'POST',
                jsonData: data,
                success: function () {
                    Taco.app.fireEvent('savesuccess', this);
                },
                failure: function (response) {
                    var msg = 'An error occured while saving your configuration. Please ensure that it is formatted correctly.';
                    var oRes = Ext.JSON.decode(response.responseText);
                    if (oRes.message) {
                        msg = oRes.message;
                    }
                    if (oRes.items && oRes.items.length) {
                        msg = oRes.items[0].message;
                    }
                    Taco.app.fireEvent('setmessage', msg, 'error');

                }
            });
        }


    }


});