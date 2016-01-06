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

    tooltipIconClass: 'taco-tooltip-icon',

    /**
    * add a tooltip icon to the hover target to identify a tooltip is available
    **/
    showToolTipIcon: true,

    /**
    * how long it will take after the hover event occurs for the mesage to show
    **/
    showDelay: 200,

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
        if (!el) {
            return 0;
        }

        var messageWidth = el.getWidth();
        var containerWidth = this.target.getWidth();

        if (!this.arrowPosition || this.arrowPosition === 'top') {
            return left - (messageWidth / 2) + (containerWidth / 2); 
        }

        else if (this.arrowPosition === 'left') {
            return (left + 10) - (messageWidth / 2) + (containerWidth / 2); 
        }

        else if (this.arrowPosition === 'right') {
            return (left + 10) - (messageWidth / 2) + (containerWidth / 2); 
        }

        else if (this.arrowPosition === 'bottom') {
            return (left + 10) - (messageWidth / 2) + (containerWidth / 2); 
        }

    },

    getOffsetHeight: function(top, el) {

        var messageHeight = el.getHeight();
        var containerHeight = this.target.getHeight();

        if (!this.arrowPosition || this.arrowPosition === 'top') {

        }

        else if (this.arrowPosition === 'left') {
            return (top + 7) - (messageHeight / 2) + (containerHeight / 2); 
        }

        else if (this.arrowPosition === 'right') {
            return (top + 7) - (messageHeight / 2) + (containerHeight / 2);    
        }

        else if (this.arrowPosition === 'bottom') {
            return (top + 7) - (messageHeight / 2) + (containerHeight / 2); 
        }
    },

    setPosition: function() {

        var position = this.target.dom.getBoundingClientRect();
        var top = position.top;
        var left = position.left;
        var el = this.tooltip.getEl();

        if (!el) {
            return;
        }

        var offsetLeft = this.offsetLeft ? left - this.offsetLeft : this.getOffsetWidth(left, el);
        var offsetTop = this.offsetTop ? top - this.offsetTop : this.getOffsetHeight(top, el);

        if (this.offsetLeftFunc) offsetLeft = this.offsetLeftFunc.apply(this);

        el.dom.style.left = offsetLeft + 'px';
        el.dom.style.top = offsetTop + 'px';
    },

    showToolTip: function(event) {
        if (!this.tooltip.getEl()) {
            return;
        }

        this.setPosition();

        if (event.type === 'mouseenter' || event.type === 'mousemove') {
            this.tooltip.removeCls('removed');
            this.tooltip.addCls(this.showCls);
        }

        else if (event.type === 'mouseleave') {
            this.hideTooltip();
        }
    },

    hideTooltip: function (cb) {
        if (!this.tooltip.getEl()) {
            return;
        }
        this.tooltip.removeCls(this.showCls);
        Ext.defer(function() {
            this.tooltip.addCls('removed');
            if (cb) {
                cb();
            }
        }, 300, this);
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

    applyTooltipIcon: function() {
        if (this.showToolTipIcon) {
            var icon = document.createElement('i');

            icon.classList.add(this.tooltipIconClass);

            this.target.appendChild(icon);
        }
    },

    applyTooltip: function() {
    	var component = Ext.ComponentQuery.query('#' + this.elementId),
            el;

        if (this.elementSelector) {
            el = Taco.app.viewPort.getEl().down(this.elementSelector);
            if (el) {
                this.instantiateToolTipEvents(el);
                this.applyTooltipIcon();
            }
            return;
        }

		if (!component || component.length < 1) {
			console.warn('No component found to attach tooltip to');
            return false;
		}

		this.component = component[0];

		switch (this.hoverTarget) {
			case 'label':
				this.instantiateToolTipEvents(this.component.labelEl);
				break;
            case 'bodyEl':
                this.instantiateToolTipEvents(this.component.bodyEl);
                break;
            case 'el':
                this.instantiateToolTipEvents(this.component.el);
                break;
			default:
				console.warn('No hover target has been established for ' + this.hoverTarget);
		}

        this.applyTooltipIcon();
    },

    instantiateToolTipEvents: function(el) {
        var timeout = null;

        if (!el) {
            return;
        }

        this.target = el;

        if (!this.target) return false;

        this.target.on(this.showEvent, function(e) {
            timeout = setTimeout(this.showToolTip.bind(this, e), this.showDelay);
        }, this, { stopPropagation: false });

        this.target.on(this.hideEvent, function() {
            clearTimeout(timeout);
            this.showToolTip({type: this.hideEvent });
        }, this);
    }

});