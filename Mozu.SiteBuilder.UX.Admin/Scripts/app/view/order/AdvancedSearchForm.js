/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.order.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser',
        'Taco.store.ChannelPicker'
    ],
    getSupportingStores: function () {
        return this.supportingStores;
    },
    defaults: {
        width: 480,
        xtype: 'textfield'
    },
    initComponent: function () {

        this.supportingStores = {
            channel: Taco.core.data.StoreManager.getOrCreate('Taco.store.ChannelPicker'),
            orderStatus: Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Submitted ",
                        id: "Submitted "
                    }, {
                        name: "Processing ",
                        id: "Processing "
                    }, {
                        name:'Accepted',
                        id:'Accepted'
                    },{
                        name: "Completed",
                        id: "Completed "
                    }, {
                        name: "Cancelled ",
                        id: "Cancelled "
                    }                
                ]
            }),
            modifiedBy: Taco.core.data.StoreManager.getOrCreate('Taco.store.AdminUsers')
        };


        this.items = [{
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            }, {
                xtype: 'combobox',
                name: 'orderStatus',
                fieldLabel: 'Order Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                //     forceSelection: true,
                store: this.supportingStores.orderStatus
            }, {
                xtype: 'combobox',
                name: 'channel',
                fieldLabel: 'Channel',
                valueField: 'code',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                //     forceSelection: true,
                store: this.supportingStores.channel
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Total Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'numberfield',
                        name: 'minTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'numberfield',
                        name: 'maxTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }]
            },
            {
                xtype: 'combobox',
                name: 'modifiedBy',
                fieldLabel: 'Modified By',
                valueField: 'id',
                displayField: 'fullName',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                store: this.supportingStores.modifiedBy
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modfied Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        //                    fieldLabel: 'Modified From',
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        //fieldLabel: 'Modified To',
                        width: 200
                    }]
            }];

        this.callParent(arguments);
    }
});