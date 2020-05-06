/**
 * @class Taco.view.customSchema.Split
 */


Ext.define('Taco.view.inventory.Split', {
    extend: 'Taco.core.ux.content.SplitContainer',
    cls: 'inventory-header',
    alias: [
        'widget.inventory-split',
        'widget.inventory.split'
    ],
    requires: [
        'Taco.core.ux.mixins.SplitEditor',
        'Taco.view.location.inventory.LocationInventory',
        'Taco.core.ux.grid.Panel',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.core.ux.mixins.PageablePageless'
    ],

    mixins: {
        splitEditor: 'Taco.core.ux.mixins.SplitEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        pageable: 'Taco.core.ux.mixins.PageablePageless'
    },

    stateId: 'taco-custom-schema',
    title: 'Inventory',

    createButtonEnabled: true,
    createButtonText: 'Create New Inventory',
    saveButtonVisible: false,
    cancelButtonVisible: false,
    advancedSearchConfig: {
        disableAdvancedSearch: true,
    },

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm',
        emptySearchText: 'Search'
    },

    contextConfig: {
        supportedLevels: ['m','c'],
        requiresContextOfType: ['m', 's', 'c']
    },

    statics: {
        factory: function (cfg, callback, scope) {
            callback.call(scope || this, Ext.create('Taco.view.inventory.Split', cfg));
        }
    },

    initComponent: function () {

        this.config.west = [this.eastGrid()];

        this.config.east = [this.westGrid()];

        this.additionalActions = this.getAdditionalActions();

        this.moreButtonCfg = {
            itemId: 'moreButton',
            menu: {
                cls: 'taco-ellipsis-split-button',
                items: [
                    {
                        //cls: 'call-to-action override',
                        text: 'Adjustment Mode',
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'Add',
                        itemId: 'adjustmentModeAdd',
                        group: 'adjustmentMode',
                        checked: true
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'Set',
                        itemId: 'adjustmentModeSet',
                        group: 'adjustmentMode'
                    }
                ]
            }
        };

        this.mixins.navHeader.init.apply(this);

        this.callParent(arguments);

    },

    onSaveSuccess: function(eventData, operation) {
        if (operation && operation.success) {
            this.showMessage('Save Complete');
            this.enableButtons(eventData.record);
        }
    },

    updateSearchContext: function(store) {
        this.navHeader.down('taco-filtercontainer').reconfigureStore(store);
    },

    enableButtons: function(record) {
       
        
    },

    getAdditionalActions: function() {
        var me = this;

        return [
     
        ];
    },

    getCurrentEntityRecord: function() {
        return this.record;
    },

    eastGrid: function() {

    	this.store = Ext.create('Taco.store.InventoriedProducts', {
    		autoLoad: true
    	});

    	this.productInventoryGrid = Ext.create('Taco.core.ux.browser.SearchListPageless', {
    		store: this.store,
            enablePaging: true,
            modelName: 'Taco.order.Model',
            enableSearch: false,
            cls: 'taco-action-on-click',
    		columns: [
    			{
	                dataIndex: 'productCode',
	                stateId: 'productCode',
	                text: 'Code',
	                width: 140,
	                menuDisabled: true
	            }, 
	            {
	                dataIndex: 'productName',
	                stateId: 'productName',
	                text: 'Name',
	                minWidth: 120,
	                resizable: false,
	                flex: 1,
	                menuDisabled: true,
	                renderer: function (value, metaData, record) {
	                    var name = record.getContextualValue('productName');;
	                    if (record.get('productUsage') == 'Configurable') {
	                        name += ' <br>(' + Ext.Array.pluck(record.get('variationOptions'), 'value').join() + ')';
	                    }

	                    return name;
	                }
	            }
          	],
          	listeners: {
	            selectionchange: {
	                fn: function (selModel, record, eOpts) {
	                    var grid = selModel.view,
	                        locationList = this.locationList,
	                        record = record[0],
	                        productCode = '';

                        if (eOpts.scope.getEast().getCollapsed() == 'right') {
                            eOpts.scope.getEast().expand();
                        }
	                    
	                    if (!record) {
	                        locationList.store.extraFilters.removeAtKey('productCode');
	                        locationList.store.removeAll();
	                        return;
	                    }
	                    
                        productCode = record.get('productCode');

                        if (locationList.store.currentPage) {
                            locationList.store.currentPage = 1;
                        }
	                    
	                    locationList.store.extraFilters.add({ id: 'productCode', property: 'productCode', value: productCode });
	                    locationList.defaultRowEditingData = {
	                        productCode: productCode
	                    };

                        locationList.store.load({ params: { start: 0, page: 1 } });

	                },
	                scope: this
	            }
	        }
    	});

		return this.productInventoryGrid;
    },

    westGrid: function() {

        this.locationList = Ext.create('Taco.view.location.inventory.LocationInventory', {
            region: 'center',
            showProductColumns: false,
            showLocationColumns: true,
            viewConfig: {
                deferEmptyText: false,
                emptyText: 'No inventory at this location.'
            }
        });

        return this.locationList;
    },

    onCreate: function(options) {
   		this.locationList.onRowEditorCreate();
    },



    showMessage: function(msg) {
        Taco.app.fireEvent('setmessage', msg, 'success');
    }

});
