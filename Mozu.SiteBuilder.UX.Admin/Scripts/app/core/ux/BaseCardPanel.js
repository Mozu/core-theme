/**
 * @class Taco.core.ux.BaseCardPanel
 */
Ext.define('Taco.core.ux.BaseCardPanel', {
    requires: ['Ext.layout.container.Border'],
    extend: 'Ext.panel.Panel',
    alias: 'widget.basecardpanel',
    cls: Taco.baseCSSPrefix + 'basecardpanel',

    uniquePanels: [],
    commonPanels: [],

    layout: 'card',
    border: false,
    innerContainerLayout:'border',
    initComponent: function () {
        var me = this,
        cards = [];

        // make a new card container for each unique panel
        Ext.Array.each(me.uniquePanels, function (panel) {
            panel.region =  'center';
            cards.push({
                xtype: 'container',
                layout: me.innerContainerLayout,
                items: [panel],
                cls: Taco.baseCSSPrefix + 'card',
                listeners: {
                    'activate': function (cmp) {
                        cmp.add(0,me.commonPanels);
                    }
                }
            });
        });

        // set cards as the items collection
        me.items = cards;
       
        this.callParent(arguments);
       
    }
});