/**
 * @class Taco.core.ux.CardPanel
 */
Ext.define('Taco.core.ux.CardPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cardpanel',
    cls: Taco.baseCSSPrefix + 'cardpanel',
    flex: 1,

    layout: {
        type: 'card',
        align: 'stretch'
    },

    requires: ['Taco.core.ux.TextFilter', 'Taco.core.ux.IconSizeSlider', 'Taco.core.ux.ListGridToggle'],

    initComponent: function (eOpts) {
        Ext.require(['Taco.core.ux.BaseGrid', 'Taco.core.ux.ListGridToggle']);

        var me = this;

        me.updateTbar(me.items);

        this.callParent(arguments);
    },

    // listen for card controls
    listeners: {
        firstcard: function () {
            this.getLayout().setActiveItem(0);
        },
        lastcard: function () {
            this.getLayout().setActiveItem(1);
        }
    },

    // add card controls to each card
    // also, add the toolbar if not already present
    updateTbar: function (items) {
        var tbars,
            cardControls = [{
                xtype: 'button',
                tooltip: 'Grid View',
                margin: 5,
                cls: 'taco-action-gridview',
                handler: function () {
                    this.up('cardpanel').fireEvent('firstcard');
                }
            }, {
                xtype: 'button',
                tooltip: 'List View',
                margin: 5,
                cls: 'taco-action-listview',
                handler: function () {
                    this.up('cardpanel').fireEvent('lastcard');
                }
            }];

        Ext.Array.each(items, function (card) {
            tbars = card.getDockedItems('toolbar[dock="top"]');

            if (tbars.length == 0) {
                card.addDocked({ xtype: 'toolbar', dock: 'top' });
                tbars = card.getDockedItems('toolbar[dock="top"]');
            }

            if (!tbars[0].down('tbfill')) {
                tbars[0].add('->');
            };
            tbars[0].add(cardControls);
        });
    },

    syncSelection: function (target) {
        var oldModel, newModel;

        if (target === 'grid') {
            oldModel = this.items.get(1).down('dataview').getSelectionModel();
            newModel = this.items.get(0).view.getSelectionModel();
        }
        else {
            oldModel = this.items.get(0).view.getSelectionModel();
            newModel = this.items.get(1).down('dataview').getSelectionModel();
        }

        newModel.select(oldModel.getSelection());

        return this;
    }
});