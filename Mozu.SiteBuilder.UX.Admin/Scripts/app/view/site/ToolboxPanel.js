/**
 * @class Taco.view.site.navigation.Tree
 */
Ext.define('Taco.view.site.ToolboxPanel', {
    extend: 'Ext.panel.Panel',

    layout: {
        type: 'fit',
        align: 'stretch'
    },
    cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'navigation',

    toggleCardFlexActive: function () {
        this.getEl().toggleCls(Taco.baseCSSPrefix + 'card-flex-active');
    },

    initComponent: function () {
        if (!this.parentPanel) Ext.Error.raise(this.$className + " requires a parentPanel config.");
        this.on({
            hide: this.toggleCardFlexActive,
            show: this.toggleCardFlexActive,
        });
    
        this.callParent(arguments);
        if (this.active) this.on('boxready', this.toggleCardFlexActive, this);
    }
});