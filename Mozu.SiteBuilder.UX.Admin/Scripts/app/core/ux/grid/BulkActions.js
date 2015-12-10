/**
 * @class Taco.core.ux.grid.BulkActions
 * @author Ben Cripps
 * 
 */

Ext.define('Taco.core.ux.grid.BulkActions', {
	extend: 'Ext.toolbar.Toolbar',

	actions: [
		{
			label: 'Sample Action Label',
			action: function() {
				console.warn('Please provide actions to the bulk action component');
			}
		}
	],

	hidden: false,

	cls: 'taco-bulk-action-toolbar',

	hiddenCls: 'shown',

	height: 37,

    initComponent: function() {
    	
    	this.items = this.buildActions();

    	this.callParent(arguments);

    	this.initEvents();
    },

    buildActions: function() {

    	this.checkbox = Ext.create('Ext.form.field.Checkbox', {
    		margin: '0 10 0 20',
            handler: this.checkboxHandler.bind(this)
    	});

    	this.countDisplay = Ext.create('Ext.Component', {
			margin: '0 8 0 0',
			html: '0 selected'
    	});

    	var items = [this.checkbox, this.countDisplay];
    	var action;

    	this.actions.forEach(function(item) {
    		action = this.getButtonConfig(item);
    		items.push(action);
    	}, this);

        this.onMenuShow = this.onMenuShow || Ext.emptyFn;	

    	return items;
    },

    checkboxHandler: function(cmp, val) {
        this.selectionmodel[val ? 'selectAll': 'deselectAll']();
    },

    initEvents: function() {
    	this.selectionmodel = this.grid ? this.grid.getSelectionModel() : null;
        this.store = this.grid ? this.grid.store : null;
    	
    	if (this.selectionmodel) {
    		this.selectionmodel.on('selectionchange', this.updateVisibility.bind(this));
    	}
    },

    updateVisibility: function(selModel) {

        this.onMenuShow(selModel);
        
    	if (selModel && selModel.getSelection().length > 0) {
    		this.addCls(this.hiddenCls);
    	}

    	else {
            this.removeCls(this.hiddenCls);
    	}

        if (this.shouldSelectCheckBox()) {
            this.checkbox.setValue(true);
        }

        else {
            //setting raw value will stop change event
            this.checkbox.setRawValue(false);
            this.checkbox.lastValue = false;
        }

    	this.updateCount(selModel);
    },

    shouldSelectCheckBox: function() {
        return this.store.getCount() === this.selectionmodel.getCount();
    },

    updateCount: function(selModel) {
    	this.countDisplay.update(selModel.getCount() + ' selected');
    },

    getButtonConfig: function(config) {
        console.log(config)
    	return Ext.apply({}, config, {
    		xtype: 'button',
            text: config.text,
            ui: 'action-primary',
            scale: 'small',
            margin: '0 10 10 0',
            cls: 'taco-link-action-button',
            handler: config.handler,
            scope: this
    	});
    }
});