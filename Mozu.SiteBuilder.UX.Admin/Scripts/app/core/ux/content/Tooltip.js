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
    showEvent: 'mouseenter',
    hideEvent: 'mouseleave',
    showDelay: 100,
    offsetLeft: 100,
    offsetTop: 0,
    defaultTpl: null,
    defaultTplData: null,
    arrowPosition: 'bottom',
    initComponent: function() {

    	this.items = [];

    	this.store = Ext.create('Taco.store.TooltipHelp');

    	this.message = this.store.findRecord('key', this.messageKey);

    	this.buildToolTip();

    	this.on('afterrender', this.onAfterRender, this, {single: true});

    	this.callParent(arguments);

        console.log(this.tooltip);
    },

    setPosition: function() {
        var position = this.target.dom.getBoundingClientRect();
        var top = position.top;
        var left = position.left;
        var dom = this.tooltip.getEl().dom;

        dom.style.left = left - this.offsetLeft + 'px';
        dom.style.top = top - this.offsetTop + 'px';
    },

    showToolTip: function(event) {

        this.setPosition();

        if (event.type === 'mouseenter' || event.type === 'mousemove') {
            this.tooltip.removeCls('removed');
            this.tooltip.addCls(this.showCls);
        }

        else if (event.type === 'mouseleave') {
            this.tooltip.removeCls(this.showCls);
            Ext.defer(function() {
                this.tooltip.addCls('removed');
            }, 300, this);
        }
    },

    buildToolTip: function() {

        var tpl = this.defaultTpl ? this.defaultTpl :  [
                '<div>{message}</div>'
            ];

        var data = this.defaultTplData ? this.defaultTpl : {
            message: this.message.get('value')
        };

        this.tooltip = Ext.create('Ext.Component', {
            cls: this.tooltipCls + ' arrow ' + this.arrowPosition.toLowerCase(),
            tpl: tpl,
            data: data
        });

    	this.items.push(this.tooltip);
    },

    rerender: function(data) {
        this.tooltip.update(data);
    },

    onAfterRender: function() {
		Ext.defer(this.applyTooltip, this.delay, this);
    },

    applyTooltip: function() {
        
    	var component = Ext.ComponentQuery.query('#' + this.elementId);

		if (!component || component.length < 0) {
			console.warn('No component found to attach tooltip to');
            return false;
		}

		this.component = component[0];

		switch (this.hoverTarget) {
			case 'label':
				this.instantiateToolTipEvents(this.component.labelEl);
				break
            case 'bodyEl':
                this.instantiateToolTipEvents(this.component.bodyEl);
			default:
				console.warn('No hover target has been established for ' + this.hoverTarget);
		}
    },

    instantiateToolTipEvents: function(cmp) {
        var timeout = null;

        this.target = cmp;

        this.target.on(this.showEvent, function(e) {
            timeout = setTimeout(this.showToolTip.bind(this, e), this.showDelay);
        }, this, { stopPropagation: false });

        this.target.on(this.hideEvent, function() {
            clearTimeout(timeout);
            this.showToolTip({type: this.hideEvent });
        }, this);

    }

});