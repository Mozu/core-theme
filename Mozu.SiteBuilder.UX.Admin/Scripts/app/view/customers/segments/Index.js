/**
 * @class Taco.view.customers.Index
 */

Ext.define('Taco.view.customers.Segments.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    
    requires: [
       // 'Taco.model.CustomerAccount',
     //   'Taco.store.CustomerSegments',
     //   'Taco.view.customers.AdvancedSearchForm',
        'Taco.store.CustomerSegments',
    'Taco.view.customers.Segments.AddRemoveModal'
    ],

    typeName: 'Customer Segment',
    modelName: 'Taco.model.CustomerSegment',
    store: { type: 'Taco.store.CustomerSegments' },
    enableRowEditing: true,
    defaultRowEditingData: {},
    useTilePanel: false,
    
  
    initComponent: function () {
        var me = this;

        this.header = {
            title: 'Customer Segments'
        };

       

        this.gridPanelConf = {
            stateful: true,
            stateId: 'statefulCustomerSegmentsGrid',
            columns: [ {
                dataIndex: 'id',
                stateId: 'id',
                text: 'Id',
                width: 130
            },{
                dataIndex: 'code',
                stateId: 'code',
                text: 'Code',
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Code",
                    msgTarget: "qtip",
                   
                    // optional enhancement to rowEditor. Makes the field only editable during a create;
                    editableOnCreateOnly: true,
                    selectOnFocus: true,
                    allowOnlyWhitespace: false
                },
                width: 200
                
            }, {
                dataIndex: 'name',
                text: 'Name',
                stateId: 'name',
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Name",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowOnlyWhitespace: false
                },
                width: 200
            }, {
                dataIndex: 'description',
                stateId: 'description',
                text: 'Description',
                flex:1,
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Name",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                }
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                flex:1,
                menuItems: [{
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
                                }],
                            listeners: {
                                confirm: function () {
                                    me.store.remove([eventData.record]);
                                    me.store.sync();
                                }
                            }
                        });

                    }
                }]
                
            }]
        };
        
        this.callParent(arguments);
    }
});
