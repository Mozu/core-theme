/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.widget.RateList', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Taco.view.settings.shipping.widget.RateEditor',
        'Taco.model.CustomShippingRate',
        'Ext.data.Store'
    ],
    
    title: '',
    
    hideSearchToolbar: true,

    enableSearch: false,
    
    enablePaging:false,

    cls: Taco.baseCSSPrefix + 'ratelist',
    
    modelName: 'Taco.model.CustomShippingRate',
    
    viewConfig: {
        deferEmptyText:false,
        emptyText:"No custom rates available"
    },
    
    initComponent: function() {
        var me = this;

        me.countryStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Countries',
            autoLoad: true,
            createOnly:true
        });
        
        me.tools = this.getTools();
        
        me.listData = me.record.get("customRates");

        
        
        
        // mock data;
        /*
        me.listData = {
            id: "custom",
            rates: [
                {
                    
                    name: "Domestic",
                    amount: 15.00,
                    type: "FLAT_RATE_PER_ITEM_EXACT_AMOUNT",
                    configuredCountries: ["US"]
                },
                {
                    
                    name: "International",
                    amount: 36.00,
                    type: "FLAT_RATE_PER_ITEM_EXACT_AMOUNT",
                    configuredCountries: ["FR", "DE"]
                }
            ]
        };
        */
        
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
                        '<div><span class="name">{name}</span><span class="amount">{amount:usMoney}</span></div>',
                        '<div class="type">',
                            '<tpl if="type == \'FLAT_RATE_PER_ITEM_EXACT_AMOUNT\'">',
                               'Flat rate per item',
                            '<tpl elseif="type==\'FLAT_RATE_PER_ORDER_EXACT_AMOUNT\'">',
                                'Flat rate per order',
                            '<tpl else>',
                                '{type}',
                            '</tpl>',
                        '</div>',
                        '<div class="countries"><span class="label">Countries:</span>',
                        '<tpl for="configuredCountries">',
                            '<tpl if="xindex &gt; 1">, </tpl>{[this.getCountryName(values)]}',
                        '</tpl>',
                        '</div>',
                    '</div>', {
                        getCountryName: function (val) {
                            //todod: load country store ahead of time.
                            var countryRecord = me.countryStore.getById(val);
                            if (countryRecord) {
                               return countryRecord.get("name");
                            }
                            return val;
                        }
                    }
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

        this.store = Ext.create('Ext.data.Store', {
            model: "Taco.model.CustomShippingRate",
            autoLoad: false,
            data: me.listData
        });

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
            record: null
        });
        
        editor.on('save', this.onRecordChange, this);
    },
    
    editItem: function (record) {
        var editor = Ext.create('Taco.view.settings.shipping.widget.RateEditor', {
            record : record
        });
        
        editor.on('save', this.onRecordChange, this);
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
    
    //onDestroy: function () {
    //    var me = this;
        
    //    me.countryStore.destroy();
    //    me.countryStore = null;
    //    me.callParent(arguments);
    //}
});
