// Unused; deprecating 



//Ext.define('Taco.view.customers.subform.StoreCredit', {
//    extend: 'Taco.view.customers.subform.Subform',
//    title: 'Store Credit',
//    cls: Taco.baseCSSPrefix + 'customer-notes',
//    initComponent: function () {
//        var me = this;
        
//        Ext.create('Ext.data.Store', {
//            storeId: 'creditStore',
//            fields: ['number', 'date', 'amount', 'status'],
//            data: {
//                'items': [
//                    { 'number': '111', "date": "11/1/2013", "amount": "5", "status": "Complete" }
//                ]
//            },
//            proxy: {
//                type: 'memory',
//                reader: {
//                    type: 'json',
//                    root: 'items'
//                }
//            }
//        });

//        me.addStoreCredit = Ext.create('Ext.form.Panel', {
//            items: [{
//                xtype: 'container',
//                layout: 'hbox',
//                items: [
//                    {
//                        xtype: 'textfield',
//                        fieldLabel: 'Amount'
//                    },
//                    {
//                        xtype: 'textfield',
//                        fieldLabel: 'Store Credit Number'
//                    }
//                ]
//            }, {
//                xtype: 'container',
//                layout: 'hbox',
//                items: [
//                    {
//                        xtype: 'textfield',
//                        fieldLabel: 'Memo',
//                        width: '80%'
//                    },
//                    {
//                        xtype: 'button',
//                        text: 'Add Credit'
//                    }
//                ]
//            }]
//        });

//        me.storeCreditGrid = Ext.create('Ext.grid.Panel', {
//            title: 'Store Credit',
//            store: Ext.data.StoreManager.lookup('creditStore'),
//            columns: [
//                { text: 'Store Credit Number', dataIndex: 'number' },
//                { text: 'Credit Date', dataIndex: 'date' },
//                { text: 'Credit Amount', dataIndex: 'amount' },
//                { text: 'Status', dataIndex: 'status' }
//            ]
//        });
        
//        this.items = [me.addStoreCredit, me.storeCreditGrid];

//        this.callParent(arguments);
//    }
//});