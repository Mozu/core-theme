Ext.define('Taco.view.publishing.component.DraftGridToolBar', {   
    extend: 'Ext.toolbar.Toolbar',
    advancedSearchConfig: {
    	quickFilterData: [],
    	advancedFormCls: '',
        emptySearchText: 'Search'

    },
    requires: [
       'Taco.core.ux.form.FilterContainer'
    ],
    style: {
    	backgroundColor: '#f3f3f3'
    },

    cls: 'taco-draft-toolbar',
    initComponent: function () {

    	var me = this;

    	me.searchBox = Ext.widget({
            xtype: 'taco-filtercontainer',
            cls: 'taco-filtercontainer',
            searchType: 'navigation',
            width: '100%',
            flex: 1,
            enableQuickFilters : this.enableQuickFilters,
            quickFilterData: [me.advancedSearchConfig.quickFilterData],
            advancedForm: me.advancedSearchConfig.form,
            advancedFormCls: me.advancedSearchConfig.advancedFormCls,
            disableAdvancedSearch: (!me.advancedSearchConfig.disableAdvancedSearch) ? false : true,
            emptySearchText: (!me.advancedSearchConfig.emptySearchText) ? '' : me.advancedSearchConfig.emptySearchText,
            store: me.store || me.getDefaultStore(),
            filterStores: me.advancedSearchConfig.stores,
            value: this.options && this.options.query ? this.options.query : undefined,
        });

        if (!me.store) {
            me.searchBox.on('afterrender', this.setStore.bind(me, 'product'));
        }

    	this.items = [
            {
                xtype: 'component',
                html: this.toolbarTitle,
                style: {
                	padding: '0px 10px',
                	fontSize: '16px',
                	color: '#9e9e9e'
                }
            }
        ];


        if (this.buttons) {
        	var buttons =  [
        		{
                xtype: 'button',
	                ui: 'link',
	                cls: 'taco-link-button',
	                text: 'Products',
                    toggleGroup: 'tabButtons',
                    allowDepress: false,
                    pressed: true,
                    enableToggle: true,
                    pressedCls: 'active',
                    buttonGroup: 'draftsButtons',
	                handler: this.setActivePanel.bind(this, 'product')

	            },
	            {
	                xtype: 'button',
	                ui: 'link',
	                cls: 'taco-link-button',
	                text: 'Content',
                    toggleGroup: 'tabButtons',
                    allowDepress: false,
                    enableToggle: true,           
                    pressedCls: 'active',
                    buttonGroup: 'draftsButtons',
	                handler: this.setActivePanel.bind(this, 'content')
            	}
            ]

        	this.items.push.apply(this.items, buttons);
        }

        this.items.push(me.searchBox);

        this.callParent(arguments);
    },

    setStore: function(type) {
        var grid = this.parentScope.down('#'+ type)
        var store = grid ? grid.store : null;
        var filterInput = this.searchBox.down('#textFilter');
        if (store) {
            this.searchBox.store = store;
        }

        if (store) {
            this.searchBox.down('#textFilter').setValue('');
            store.proxy.extraParams = {};
            store.clearFilter();
        }

    },

    setActivePanel: function(type) {
    	var index = type === 'product' ? 0 : 1;
    	this.parentScope.panel.getLayout().setActiveItem(index);
    	this.setStore(type);
    },

    getDefaultStore: function() {
        return Ext.create('Ext.data.Store', {
            model: 'Taco.core.data.Model'
        });
    }

});
