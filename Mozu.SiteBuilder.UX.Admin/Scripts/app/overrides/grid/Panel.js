/**
 *  adds and removes a css class to the grid el when focus is passed in and out of the grid component;
 *
 */

Ext.define('Taco.overrides.grid.Panel', {
    override: 'Ext.grid.Panel',  
    
    focusinCls: "x-grid-focusin",

    onBoxReady: function () {
        this.mon(this.body.el, 'focusin', function () {            
            this.onFocusIn();
        }, this)

        this.mon(this.body.el, 'focusout', function () {            
            this.onFocusOut();
        }, this)

        this.callParent(arguments);
    },
    onFocusIn: function () {
        this.el.addCls(this.focusinCls)
    },
    onFocusOut: function () {
        this.el.removeCls(this.focusinCls)
    }
});
