Ext.define('Taco.view.settings.shipping.AddCarrierAccount', {
    extend: 'Taco.core.ux.form.Form',
    enableSearchBarInHeader: false,
    requires: [],
    cascadeChildTasks: true,
    padding: '0 0 20 0',


    initComponent: function () {
        var me = this;

        me.items = [];
        me.carriers = [];

        if (me.record.get('carrierId') === "ups") {

            this.getUpsColumnConfig();
        }

        if (me.record.get('carrierId') === "fedex") {
            this.getFedexColumnConfig();
        }

        if (me.record.get('carrierId') === "usps") {
            this.getUspsColumnConfig();
        }
        //if (me.record.get('carrierId') === "canadapost") {
        //    this.getCanadaPostColumnConfig();
        //}

        me.callParent(arguments);
    },
    getIndexRoute: function () {
        return this.indexRoute;
    },

    getEditRoute: function () {
        return this.editRoute;
    },

    getUpsColumnConfig: function () {
        var me = this;
        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                fieldLabel: 'Nickname',
                name: 'name',
                margin: "0 0 0 30",
                width: 300,
                allowBlank: false,
                inputType: 'text'
            });
        me.items.push(settingName);


        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'apiusername',
                margin: "0 0 0 30",
                width: 300,
                fieldLabel: 'API user name'
            });
        me.items.push(settingName);


        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'apipassword',
                margin: "0 0 0 30",
                fieldLable: 'API password',
                width: 300,
                fieldLabel: 'password',
                inputType: 'password',
                emptyText: '*****'
            });
        me.items.push(settingName);


        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'licensekey',
                width: 300,
                margin: "0 0 0 30",
                fieldLabel: 'license key'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'shippernumber',
                width: 300,
                margin: "0 0 0 30",
                fieldLabel: 'shipper number'
            });
        me.items.push(settingName);
    },

    getFedexColumnConfig: function () {
        var me = this;
        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                width: 300,
                fieldLabel: 'Nickname',
                name: 'name',
                allowBlank: false,
                margin: "0 0 0 30",
                inputType: 'text'

            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                margin: "0 0 0 30",
                width: 300,
                name: 'apiusername',
                fieldLabel: 'API user name'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'apipassword',
                width: 300,
                margin: "0 0 0 30",
                fieldLable: 'API password',
                fieldLabel: 'password',
                inputType: 'password',
                emptyText: '*****'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                margin: "0 0 0 30",
                width: 300,
                name: 'meternumber',
                fieldLabel: 'meter number'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                margin: "0 0 0 30",
                name: 'accountnumber',
                width: 300,
                fieldLabel: 'account number'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'selectfield',
                margin: "0 0 0 30",
                width: 325,
                name: 'pickuptype',
                fieldLabel: 'pickup type',
                valueField: 'id',
                displayField: 'value',
                //value: '',
                allowBlank: true,
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
            });
        me.items.push(settingName);
    },

    getUspsColumnConfig: function () {
        var me = this;
        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                allowBlank: false,
                fieldLabel: 'Nickname',
                name: 'name',
                margin: "0 0 0 30",
                width: 300,
                inputType: 'text'
            });
        me.items.push(settingName);

        var settingName = Ext.widget(
            {
                xtype: 'textfield',
                name: 'easypostapikey',
                margin: "0 0 0 30",
                width: 300,
                fieldLabel: 'EasyPost API key'

            });
        me.items.push(settingName);

    },

    //getCanadaPostColumnConfig: function () {
    //    var me = this;
    //    var settingName = Ext.widget(
    //        {
    //            xtype: 'textfield',
    //            allowBlank: false,
    //            fieldLabel: 'Nickname',
    //            name: 'name',
    //            width: 300,
    //            margin: "0 0 0 30",
    //            inputType: 'text'
    //        });
    //    me.items.push(settingName);
    //    var settingName = Ext.widget({
    //        xtype: 'textfield',
    //        name: 'canadapostapikey',
    //        width: 300,
    //        margin: "0 0 0 30",
    //        fieldLabel: 'CanadaPost API Key'

    //    });
    //    me.items.push(settingName);
    //    var settingName = Ext.widget({
    //        xtype: 'textfield',
    //        name: 'contractid',
    //        fieldLabel: 'Contract ID',
    //        width: 300,
    //        margin: "0 0 0 30",
    //    });
    //    me.items.push(settingName);
    //    var settingName = Ext.widget({
    //        xtype: 'textfield',
    //        name: 'accountnumber',
    //        fieldLabel: 'Customer Number',
    //        width: 300,
    //        margin: "0 0 0 30",
    //    });
    //    me.items.push(settingName);

    //},
   
});
