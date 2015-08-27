/**
 * @class Taco.core.ux.action.Action
 * An action.
 */

Ext.define('Taco.core.ux.action.Action', {
    extend: 'Ext.Component',
    alias: 'widget.action',
    baseCls: 'taco-action',
    mixins: ['Taco.core.util.GetsParentPage'],
    autoEl: {
    	tag: 'a',
    	href: '#'
    },
    text: 'Action',

    initComponent: function() {
        this.html = this.text;

        this.callParent(arguments);

        this.on({
            click: {
                fn: this.onClick,
                element: 'el',
                scope: this 
            }
        })
        
        if (this.click) {
        	this.on({
        		click: this.click,
                scope: this.scope || this
        	});
        }
    },

    /**
     * @private
     * Are you sure you weren't looking for "click" instead of onClicK?
     */
    onClick: function (e) {
        if (e == this) {
            console.log('lord...');
            this.fireEvent('click', this);
            return;
        }
        e.stopEvent();

        if (this.fireEvent('beforeclick', this, e) !== false) {
            this.fireEvent('click', this);
        }
    },

   
    
    onDisable: function () {
        var el = this.rendered ? this.el : this.protoEl;
        if (!el) {
            return;
        }
        
        el.set({
            disabled: 'disabled'
        });
    },
    onEnable: function() {
        var el = this.rendered ? this.el : this.protoEl;
        if (!el) {
            return;
        }
        this.el.set({
            disabled: null
        }, false);
    }
	
});
