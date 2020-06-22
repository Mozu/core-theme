/**
 * @class Taco.view.settings.shipping.EditCarrierAccount
 */
Ext.define('Taco.view.settings.shipping.EditCarrierAccount', {
    extend: 'Taco.core.ux.form.FullEditor',
    enableSearchBarInHeader: false,
    requires: ['Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.core.ux.form.field.Code', 'Taco.store.CarrierAccounts', 'Taco.model.CarrierAccountModel'],

    formCls: 'Taco.core.ux.form.Form',
    cascadeChildTasks: true,
    padding: '0 0 20 0',

    header: null,

    initComponent: function () {
        var me = this;

        me.header = null;
        me.items = [];
        this.title = "Edit Carrier Account";
        if (me.record.data.carrierId === "ups") {
            this.setUpsColumnConfig();
        }

        if (me.record.data.carrierId === "fedex") {
            this.setFedexColumnConfig();  
        }

        if (me.record.data.carrierId === "usps") {
            this.setUspsColumnConfig();
        }

        if (me.record.data.carrierId === "canadapost") {
            this.setCanadaPostColumnConfig();
        }

        if (me.record.data.carrierId === "purolator") {
            this.setPurolatorColumnConfig();
        }
       
        me.callParent(arguments);
    },
    initTitle: Ext.emptyFn,

    getIndexRoute: function () {
        return 'shipping/CarrierAccounts';
    },

    getEditRoute: function () {
        return this.editRoute;
    },

    convertKeyValueToObject: function () {
        var me = this;
        var Values = {};

        if (me.record.data.values != undefined && me.record.data.values != null) {
        for (var i = 0; i < me.record.data.values.length; i++) {
            Values[me.record.data.values[i].key] = me.record.data.values[i].value;
            }
        }
        return Values;
    },
     

    setUpsColumnConfig: function () {
        var me = this;

        var getValues = me.convertKeyValueToObject();

        this.formCfg = {
            // flex: 1,
            xtype: 'formform',
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    allowBlank: false,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    value: me.record.get('name'),
                    inputType: 'text'
                },
                {

                    xtype: 'textfield',
                    name: 'apiusername',
                    value: getValues.apiusername,
                    margin: "0 0 0 30",
                    maxWidth: 300,
                    fieldLabel: 'API user name'
                },
                {
                    xtype: 'textfield',
                    name: 'apipassword',
                    margin: "0 0 0 30",
                    value: getValues.apipassword,
                    maxWidth: 300,
                    fieldLable: 'API password',
                    fieldLabel: 'password',
                    inputType: 'password',
                    emptyText: '*****'
                },
                {
                    xtype: 'textfield',
                    name: 'licensekey',
                    value: getValues.licensekey,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    fieldLabel: 'license key'
                },
                {
                    xtype: 'textfield',
                    name: 'shippernumber',
                    value: getValues.shippernumber,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    fieldLabel: 'shipper number'
                }
            ]

        };
    },

    setFedexColumnConfig: function () {
        var me = this;
        var getValues = me.convertKeyValueToObject();
        this.formCfg = {
            xtype: 'formform',
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    maxWidth: 300,
                    allowBlank: false,
                    margin: "0 0 0 30",
                    value: me.record.get('name'),
                    inputType: 'text'
                },
                {

                    xtype: 'textfield',
                    margin: "0 0 0 30",
                    maxWidth: 300,
                    value: getValues.apiusername,
                    name: 'apiusername',
                    fieldLabel: 'API user name'
                },
                {
                    xtype: 'textfield',
                    name: 'apipassword',
                    maxWidth: 300,
                    value: getValues.apipassword,
                    margin: "0 0 0 30",
                    fieldLable: 'API password',
                    fieldLabel: 'password',
                    inputType: 'password',
                    emptyText: '*****'
                },
                {
                    xtype: 'textfield',
                    margin: "0 0 0 30",
                    maxWidth: 300,
                    value: getValues.meternumber,
                    name: 'meternumber',
                    fieldLabel: 'meter number'
                },
                {
                    xtype: 'textfield',
                    margin: "0 0 0 30",
                    maxWidth: 300,
                    value: getValues.accountnumber,
                    name: 'accountnumber',
                    fieldLabel: 'account number'
                },
                {
                    xtype: 'selectfield',
                    margin: "0 0 0 30",
                    maxWidth: 325,
                    name: 'pickuptype',

                    fieldLabel: 'pickup type',
                    valueField: 'id',
                    displayField: 'value',
                    value: getValues.pickuptype,
                    allowBlank: true,
                    width: 183,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', 'value'],
                        data: [
                            //{ "id": '', value: '' },
                            { "id": "BUSINESS_SERVICE_CENTER", "value": "Business Serivce Center" },
                            { "id": "DROP_BOX", "value": "Drop Box" },
                            { "id": "REGULAR_PICKUP", "value": "Regular Pickup" },
                            { "id": "REQUEST_COURIER", "value": "Request Courier" },
                            { "id": "STATION", "value": "Station" }
                        ]
                    })
                }
            ]

        };
    },

    setUspsColumnConfig: function () {
        var me = this;
        var getValues = me.convertKeyValueToObject();
        this.formCfg = {
            xtype: 'formform',
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    maxWidth: 300,
                    allowBlank: false,
                    margin: "0 0 0 30",
                    value: me.record.get('name'),
                    inputType: 'text'
                },
                {
                    xtype: 'textfield',
                    allowBlank: false,
                    fieldLabel: 'Easy Post API key',
                    name: 'easypostapikey',
                    margin: "0 0 0 30",
                    value: getValues.easypostapikey,
                    maxWidth: 300,
                    inputType: 'password',
                    emptyText: '*****'
                }
            ]
        }
    },

    setCanadaPostColumnConfig: function () {
        var me = this;
        var getValues = me.convertKeyValueToObject();
        this.formCfg = {
            xtype: 'formform',
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    allowBlank: false,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    value: me.record.get('name'),
                    inputType: 'text'
                },
                {
                    xtype: 'textfield',
                    name: 'canadapostapikey',
                    maxWidth: 300,
                    value: getValues.canadapostapikey,
                    margin: "0 0 0 30",
                    fieldLabel: 'CanadaPost API Key'

                },

                {
                    xtype: 'textfield',
                    name: 'contractid',
                    fieldLabel: 'Contract ID',
                    maxWidth: 300,
                    value: getValues.contractid,
                    margin: "0 0 0 30",



                },
                {
                    xtype: 'textfield',
                    name: 'accountnumber',
                    fieldLabel: 'Customer Number',
                    maxWidth: 300,
                    value: getValues.accountnumber,
                    margin: "0 0 0 30",
                },

            ]
        }
    },

    setPurolatorColumnConfig: function () {
        var me = this;
        var getValues = me.convertKeyValueToObject();
        this.formCfg = {
            xtype: 'formform',
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    allowBlank: false,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    value: me.record.get('name'),
                    inputType: 'text'
                },
                {
                    xtype: 'textfield',
                    name: 'accountnumber',
                    fieldLabel: 'Account Number',
                    value: getValues.accountnumber,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                },

                {
                    xtype: 'textfield',
                    name: 'purolatorapikey',
                    value: getValues.purolatorapikey,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    fieldLabel: 'Purolator API Key'

                },
                {
                    xtype: 'textfield',
                    name: 'apikeypassword',
                    fieldLabel: 'Purolator API Key Password',
                    value: getValues.apikeypassword,
                    maxWidth: 300,
                    margin: "0 0 0 30",
                    inputType: 'password',
                    emptyText: '*****'
                },

            ]
        }
    },



    getCarrierAccountDetails: function () {
        var me = this;
        var carrierId = me.record.get('carrierId');
        var settings = me.getForm().getValues(false, false, false, true);
        var Name = settings['name'];
        delete settings.name;
        var model = {
            code: me.record.get('code'),
            carrierId: carrierId,
            name: Name,
            values: []
        }

        //Convert Carrier Values to Key Value Pair
        var getSettings = Object.entries(settings);
        getSettings.forEach(function (element) {
            model.values.push({
                key: element[0],
                Value: element[1]
            });
        });
        return model;

    },

   doSave: function () {
       var me = this;
       var model = me.getCarrierAccountDetails();
       try {
           data = Ext.JSON.encode(model);
       } catch (e) {
           Taco.app.fireEvent('setmessage', 'The JSON you are attempting to save is not in a valid format', 'error');
           me.saveFailure();
           return;
       }

       Ext.Ajax.request({
           url: '/admin/app/carriers/credentialsset/update',
           method: 'POST',
           jsonData: data,
           success: function (response) {
               me.saveSuccess(response);
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
               me.saveFailure();
           }
       });
       // me.saveSuccess(data);
    }

});

