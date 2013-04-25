/**
 * @class Taco.view.site.navigation.Tree
 */
Ext.define('Taco.view.site.ToolboxPanel', {
    extend: 'Ext.panel.Panel',

    layout: {
        type: 'fit',
        align: 'stretch'
    },
    height: 460,
    cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'navigation',

    hasBackButton: true,
    //hasNav:true,
    showInNav:true,
    createBackButton: function () {
        var me = this;
        this.tbar = [{
            xtype: 'action',
                text: 'Back',
                click: {
                    fn: function () { me.cardPanel.showItem(0); }
                }
            }, '->', {
                xtype: 'tbtext',
                text: this.title
            }];
    },

    toggleCardFlexActive: function () {
        this.getEl().toggleCls(Taco.baseCSSPrefix + 'card-flex-active');
    },

    initComponent: function () {
        this.on({
            hide: this.toggleCardFlexActive,
            show: this.toggleCardFlexActive,
        });
    
        if (this.hasBackButton) this.createBackButton();
        this.callParent(arguments);
        if (this.active) this.on('boxready', this.toggleCardFlexActive, this);
    }
});