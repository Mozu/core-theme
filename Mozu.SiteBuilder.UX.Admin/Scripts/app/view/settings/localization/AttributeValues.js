/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.AttributeValues', {
    requires:['Taco.store.LocalizedAttributeValues'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedattrvaluesgrid',

    createButtonText: "Create New Zone",
    title: "Attribute Values",
  

    createRoute: 'localization/zonescreate',
    editorRoute: 'localization/zonesedit',
   
    store: { type: 'Taco.store.LocalizedAttributeValues' },

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'attributeFQN',
                text: 'MC Attribute Id',
                hideable: false,
                minWidth: 300
                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                //}
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'adminName',
                text: 'MC Attribute Id',
                flex: 1,
                width: 150
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                flex: 1,
                menuItems: [
                    {
                        text: 'Add Customers',
                        requiredBehaviors: {
                            model: 'Taco.model.CustomerAccount',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            var modal = Ext.create('Taco.view.customers.Segments.AddRemoveModal',
                            {
                                segmentId: eventData.record.getId(),
                                batchMethod: 'add',
                                segmentCode: eventData.record.get('code')
                            });
                        }
                    }, {
                        text: 'Remove Customers',
                        requiredBehaviors: {
                            model: 'Taco.model.CustomerAccount',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            var modal = Ext.create('Taco.view.customers.Segments.AddRemoveModal',
                            {
                                segmentId: eventData.record.getId(),
                                batchMethod: 'remove',
                                segmentCode: eventData.record.get('code')
                            });
                        }
                    }, {
                        text: 'Delete Segment',
                        requiredBehaviors: {
                            model: 'Taco.model.CustomerAccount',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            var modal = Ext.create('Taco.core.ux.window.Alert', {
                                autoShow: true,
                                closeAction: 'destroy',
                                items: [
                                    {
                                        html: 'Do you really want to Delete Segment: ' + eventData.record.get('code')
                                    }
                                ],
                                listeners: {
                                    confirm: function () {
                                        me.store.remove([eventData.record]);
                                        me.store.sync();
                                    }
                                }
                            });

                        }
                    }
                ]
            }
        ];
    }
});


