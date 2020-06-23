Ext.define('Taco.view.settings.shipping.SelectCarrierType', {
    extend: 'Taco.core.ux.form.FullEditor',
    enableSearchBarInHeader: false,
    requires: [
        'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.view.settings.shipping.EditCarrierAccount',
        'Taco.core.ux.form.field.Code'
    ],
    formCls: 'Taco.core.ux.form.Form',
    autoTitle: true,
    enableNavHeader: true,
    autoScroll: true,
    title: "Create Carrier Account",
    initComponent: function () {
        var me = this;

        this.title = "Create Carrier Account";
       // this.carrierAccountStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CarrierAccountDefinitions');

        
        this.carrierAccountCombo = Ext.widget(
            {
            xtype: 'selectfield',
            fieldLabel: 'Carrier Types',
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: [
                        { "id": "canadapost", "name": "CanadaPost" },
                        { "id": "fedex", "name": "FedEx" },
                        { "id": "purolator", "name": "Purolator" },
                        { "id": "ups", "name": "UPS" },
                        { "id": "usps", "name": "USPS" }
                    ]
                }), 
            queryMode: 'local',
            allowBlank: false,
            width: 325,
            margin: "0 0 0 30",
                displayField: 'name',
                //listeners: {
                //    scope: this,
                //    afterRender: function (me) {
                //        //var getRecord = store1.getById('fedex');
                //        if (this.record) {
                //            me.setValue(this.record.get('carrierId'));
                //        }
                       
                //    }
                //},
            //allowBlank: true,
            triggerOnClick: true,
            valueField: 'id',
            emptyText: 'Select a Carrier Type'
        });

        this.carrierAccountContainer = Ext.widget({
            xtype: 'form',
        });


        this.carrierAccountTypes = Ext.create('Ext.form.Panel', {

            items: [
                this.carrierAccountCombo,
                this.carrierAccountContainer
            ]
        });

        this.formCfg = {
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'

            },
            title: this.title,
            items: [this.carrierAccountTypes]
        },
        //this.items = [this.carrierAccountTypes];

        this.callParent(arguments);

        this.carrierAccountCombo.on({
            change: this.onCarrierTypesChange,
            scope: this
        });
    },

    onCarrierTypesChange: function () {
        //if (this.carrierAccountStore.isLoading()) {
        //    this.mon(this.carrierAccountStore, 'load', this.onCarrierTypesChange, this);
        //    return;
        //}
        var carrierAccountDef = this.carrierAccountCombo.findRecordByValue(this.carrierAccountCombo.getValue());

        if (carrierAccountDef) {
        this.record.data.carrierId = carrierAccountDef.data.id;
        }
        if (!carrierAccountDef) {
            return;
        }
        this.carrierAccountContainer.removeAll();

        this.carrierAccountContainer.add(
            Ext.create('Taco.view.settings.shipping.AddCarrierAccount', {
                title: " ",
                record: this.record,
                carrierAccountDefinition: carrierAccountDef
            })
        );
    },
    getIndexRoute: function () {
        return 'shipping/CarrierAccounts';
    },

    getEditRoute: function () {
        return this.editRoute;
    },

    getCarrierAccountDetails: function () {
        var me = this;
        var carrierId = this.carrierAccountCombo.value;
        var settings = this.carrierAccountContainer.getValues(false, false, false, true);
        var Name = settings['name'];
        delete settings.name;
        var model = {
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
            url: '/admin/app/carriers/credentialsset/create',
            method: 'POST',
            jsonData: data,
            success: function (response) {
                me.saveSuccess(response);
                Ext.defer(function () {
                    return Taco.core.StateManager.attemptNavigate(me.getIndexRoute());
                }, 10);
                
            },
            failure: function (response) {
                var msg = 'An error occured while saving your Carrier Settings. Please ensure that it is formatted correctly.';
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
    }
});