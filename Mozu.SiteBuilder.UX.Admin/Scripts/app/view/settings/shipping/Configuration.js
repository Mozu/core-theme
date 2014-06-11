/**
 * 
 */
Ext.define('Taco.view.settings.shipping.Configuration', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.shippingZonesEditor',
    requires: [
        'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule'
    ],
    modelName: 'Taco.model.TargetRule',
    store: {
        type: 'Taco.store.ShippingZones'
    },
    //editorName: 'Taco.view.discount.Edit',
    title: 'Shipping Zones',


    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    initComponent: function () {
        var me = this;
        me.header = {
            actions: [
                {
                    xtype: 'primarybutton',
                    text: 'Create New Rule',
                    click: function () {
                        Taco.core.StateManager.attemptNavigate('shippingzones/edit');
                    }
                }
            ]
        };
        this.callParent(arguments);
    },

    gridPanelConf: {
        columns: [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                text: 'Code',
                hideable: false,
            
                minWidth: 300
                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                //}
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'description',
                text: 'Description',
                flex:1,
                width: 150,
               
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [
                    {
                        text: 'Delete',
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Discount',
                        //    behavior:'destroy'
                        //},
                        menuColumnHandler: 'destroyMenuColumnHandler'
                    }
                ]
            }
        ]
    },


    /**
    * Handler for the list item click event
    */
    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('discounts/edit/' + record.getId(), { id: record.getId() });
        }
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});