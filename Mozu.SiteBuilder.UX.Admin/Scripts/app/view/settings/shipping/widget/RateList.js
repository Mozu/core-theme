/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.widget.RateList', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
 
        'Taco.view.settings.shipping.widget.RateEditor',
        'Taco.model.CustomShippingRate'
    ],
    
    title: '',
    
    hideSearchToolbar: true,

    enableSearch: false,
    
    enablePaging:false,

    cls: Taco.baseCSSPrefix + 'ratelist',
    
    modelName: 'Taco.model.CustomShippingRate',
    
    viewConfig: {
        deferEmptyText:true,
        emptyText:"No custom rates available"
    },
    
    initComponent: function() {
        var me = this;

        this.store = Ext.create('Ext.data.Store', {
            model: "Taco.model.CustomShippingRate",
            autoLoad: false,
            viewConfig: {
                emptyText: "loading...",
                deferEmptyText: false
            }
        });
        
        me.listData = me.record.get("customRates");

      
        
        // add loading mask to grid while we wait for the countryStore to load;
        me.on('viewready', function () {
            // note that I have to use the mask instead of setLoading. SetLoading is floating and doesn't work with scrolling and is really buggy;
            
                // load the store data now that the countryStore data is available to convert the code to the viewable name
                me.store.loadData(me.listData);
            
        }, me, {
            single: true
        });
        
        me.tools = this.getTools();
        
        this.columns = [
            {
                flex: 1,
                xtype:"templatecolumn",
                text: "Custom Rate Details",
                sortable: false,
                resizable: false,
                menuDisabled: true,
                tpl: [
                    '<div class="rate-item">',
                        '<div><span class="name">{name}</span><span class="amount"><tpl if="type==\'CUSTOM_PERCENTAGE_PER_ORDER\'">{amount}%<tpl else>{[Taco.app.context.getCurrent().formatCurrency(values.amount)]}</tpl></span></div>',
                        '<div class="type">',
                            '<tpl if="type == \'CUSTOM_FLAT_RATE_PER_ITEM_EXACT_AMOUNT\'">',
                               'Flat rate per item',
                            '<tpl elseif="type==\'CUSTOM_FLAT_RATE_PER_ORDER_EXACT_AMOUNT\'">',
                                'Flat rate per order',
                            '<tpl elseif="type==\'CUSTOM_PERCENTAGE_PER_ORDER\'">',
                                'Percent of order',
                            '<tpl else>',
                                '{type}',
                            '</tpl>',
                        '</div>',
                      
                    '</div>'
                ]
            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuDisabled: true,
                sortable: false,
                menuItems: [
                    {
                        text: 'Remove Rate',
                        /*
                        requiredBehaviors: {
                            model: 'Taco.model.LocationInventory',
                            behavior:'destroy'
                        },
                        */
                        //menuColumnHandler: 'destroyMenuColumnHandler',
                        menuColumnHandler: function (item, eventData) {
                            var record = eventData.record;
                            
                            me.removeItem(record);
                        }
                    }, {
                        text: 'Edit Rate',
                        /*
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        */
                        menuColumnHandler: function (item, eventData) {
                            var record = eventData.record;
                            
                            me.editItem(record);
                        }
                    }
                ]
            }
        ];

        

        //me.on('selectionchange', me.editItem, me);
        
        me.on('cellclick', function (view, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
            var column = view.getHeaderAtIndex(cellIndex);
            // don't edit if the user clicks the actions column
            if (column.xtype == "taco.menucolumn") {
                return;
            }
            me.editItem(record)
        }, me);

        this.callParent(arguments);

        // when saveTasks succeed, they fire this custom `received` event
        // the first arg, `record`, doesn't actually contain the updated data
        // but the operation does, so we have to extract it and do this the hard way
        this.record.on({
            received: {
                scope: this,
                fn: function (record, operation) {
                    var resp = Ext.JSON.decode(operation.response.responseText, true);
                    var newRates;

                    if (resp && resp.items) {
                        newRates = resp.items.customRates;
                        record.set('customRates', newRates);

                        this.store.removeAll();
                        this.store.add(newRates);
                    }
                }
            }
        });
    },

    getTools: function () {
        var me = this;
        return [{
            xtype: 'button',
            ui: "action-primary",
            scale: "medium",
            margin: "0 0 20, 0",
            text: "Create New Custom Rate",
            handler: me.createItem,
            scope: me
        }];

    },

    createItem: function () {
        
        var editor = Ext.create('Taco.view.settings.shipping.widget.RateEditor', {
            record: null,
            list: this
        });
        
        editor.on('savesuccess', this.onRecordChange, this);
    },
    
    editItem: function (record) {
        var editor = Ext.create('Taco.view.settings.shipping.widget.RateEditor', {
            record : record,
            list: this
        });
        
        editor.on('savesuccess', this.onRecordChange, this);
    },
    
    onRecordChange: function (view, e) {
        var me = this,
            record = view.record,
            isCreate = view.isCreate;
        
        if (isCreate) {
            // id for the records is their index;
            me.store.add(record);
        }
        
        //Note: edits will happen automatically since the editor is working on the actual record in the store;
    },
    
    removeItem: function (record) {
        var me = this;
        // todo confirm;
        me.store.remove(record);
    },
    
    onDestroy: function () {
        var me = this;
        me.callParent(arguments);
    }
});
