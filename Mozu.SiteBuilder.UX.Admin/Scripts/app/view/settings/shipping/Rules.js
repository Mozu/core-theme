/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.shipping.Rules', {
    extend: 'Taco.core.ux.browser.SearchList',
  
    requires: [
         'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule'

    ],
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.TargetRule',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,


    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,

    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    

    showActionsColumn: true,

    hideSearchToolbar: false,
    selType: 'rowmodel',
   


   

    autoScroll: true,




    enableQuickFilters: false,

    advancedSearchConfig: {
        advancedFormCls: 'Taco.core.ux.form.Form',

        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{}, 'All Orders']
        ]
    },




    stateful: false,

    //stateId: 'statefulOrderGrid',



    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        me.callParent(arguments);
    },
   
    onCreate: function () {
        return Taco.core.StateManager.attemptNavigate(this.createRoute);
    },

    createButtonText: "Create New Zone",
    title: "Shipping Zones",
    createRoute: 'shipping/zonescreate',
    editorRoute: 'shipping/zonesedit',

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };
        
        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate( this.editorRoute + '/' + record.getId(), complexMetaData);
        }, 1, this);
    },
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
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
                flex: 1,
                width: 150,

            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                flex: 1,
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
            }
        ];



    },



});


