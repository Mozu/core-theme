/**
 * Created by ben cripps on 12/11/2015.
 */

Ext.define('Taco.core.ux.content.Tooltip', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco-tooltip',
    requires: [
    	'Taco.store.TooltipHelp'
    ],
    renderTo: document.body,
    delay: 10,
    hoverTarget: 'label',
    messageKey: 'default',
    tooltipCls: 'taco-tooltip',
    showCls: 'shown',
    removedCls: 'removed',
    showEvent: 'mouseover',
    hideEvent: 'mouseout',
    showDelay: 100,
    initComponent: function() {

    	this.items = [];

    	this.store = Ext.create('Taco.store.TooltipHelp');

    	this.message = this.store.findRecord('key', this.messageKey);

    	this.buildToolTip();

    	this.on('afterrender', this.onAfterRender, this, {single: true});
    	
    	this.callParent(arguments);
    },

    setPosition: function() {
        var position = this.labelEl.dom.getBoundingClientRect();
        var top = position.top;
        var left = position.left;

        this.tooltip.getEl().dom.style.left = left - (this.tooltip.getWidth() / 2.6) + 'px';
        this.tooltip.getEl().dom.style.top = top - (this.tooltip.getHeight() / 1.3) + 'px';
    },

    showToolTip: function(event) {
        
        this.setPosition();


        if (event.type === 'mouseover' || event.type === 'mousemove') {
            this.tooltip.removeCls('removed');
            this.tooltip.addCls(this.showCls);
        }

        else {
            this.tooltip.removeCls(this.showCls);
            Ext.defer(function() {
                this.tooltip.addCls('removed');
            }, 300, this);
        }
    },

    buildToolTip: function() {
        
    	this.tooltip = Ext.create('Ext.Component', {
            cls: this.tooltipCls,
    		tpl: [
    			'<div class="{cls}"">{message}</div>'
                
    		],
    		data: {
                message: this.message.get('value')
            }
    	});

    	this.items.push(this.tooltip);
    },

    onAfterRender: function() {
		Ext.defer(this.applyTooltip, this.delay, this);
    },

    applyTooltip: function() {

    	var component = Ext.ComponentQuery.query('#' + this.elementId);
		
		if (!component || component.length < 0) {
			console.warn('No component found to attach tooltip to');
		}

		this.component = component[0];

		switch (this.hoverTarget) {
			case 'label': 
				this.instantiateToolTipEvents();
				break
			default:
				console.warn('No hover target has been established for ' + this.hoverTarget);
		}
    },

    instantiateToolTipEvents: function() {
        var timeout = null;

        this.labelEl = this.component.labelEl;

        this.labelEl.on(this.showEvent, function(e) {
            timeout = setTimeout(this.showToolTip.bind(this, e), this.showDelay);
        }, this);

        this.labelEl.on(this.hideEvent, function() {
            clearTimeout(timeout);
            this.showToolTip({type: 'mouseout'});
        }, this);
        
    },

});