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

    /**
    * how long it will take after the hover event occurs for the mesage to show
    **/
    showDelay: 100,

    /**
    * the offsetleft of the tooltip
    **/
    offsetLeft: null,

    /**
    * If the message is of dynamic width, you may pass in a function that determines the offsetleft
    * if this paramater is not null, the component will use this value over offsetLeft
    **/
    offsetLeftFunc: null,

    /**
    * the offsetTop of the tooltip
    **/
    offsetTop: null,

    /**
    * a render template can be passed to the tooltip
    **/
    defaultTpl: null,

    /**
    * if a render template is passed, the template will default to { data: message } or you can pass in a custom object
    **/
    defaultTplData: null,

    /**
    * where the arrow position will be on the tooltip
    **/
    arrowPosition: 'bottom',
    
    initComponent: function() {

    	this.items = [];

    	this.store = Ext.create('Taco.store.TooltipHelp');

    	this.message = this.store.findRecord('key', this.messageKey);

    	this.buildToolTip();

    	this.on('afterrender', this.onAfterRender, this, {single: true});

    	this.callParent(arguments);

    },

    getOffsetWidth: function(left, el) {
        var messageWidth = el.getWidth();
        var containerWidth = this.target.getWidth();

        return left - (messageWidth / 2) + (containerWidth / 2);
    },

    setPosition: function() {
        var position = this.target.dom.getBoundingClientRect();
        var top = position.top;
        var left = position.left;
        var el = this.tooltip.getEl();
        var offsetLeft = this.offsetLeft ? left - this.offsetLeft : this.getOffsetWidth(left, el);

        if (this.offsetLeftFunc) offsetLeft = this.offsetLeftFunc.apply(this);

        el.dom.style.left = offsetLeft + 'px';
        el.dom.style.top = top - this.offsetTop + 'px';
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

    getTemplate: function() {
        var insert = this.defaultTpl ? this.defaultTpl :  [
            '<div>{message}</div>'
        ];
        var tpl = ['<div class="message-wrapper">'];

        tpl.push.apply(tpl, insert);

        tpl.push('</div>');

        return tpl;
    },

    buildToolTip: function() {

        var tpl = this.getTemplate();

        var data = this.defaultTplData ? this.defaultTplData : {
            message: this.message.get('value')
        };

        this.tooltip = Ext.create('Ext.Component', {
            cls: this.tooltipCls + ' arrow ' + this.arrowPosition.toLowerCase(),
            tpl: tpl,
            data: data
        });

    	this.items.push(this.tooltip);
    },

    update: function(data) {
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
                break;
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