/**
 * @class Taco.view.order.modal.EditOrderDetail
 */
Ext.define('Taco.view.order.modal.EditOrderDetail', {
    extend: 'Ext.window.Window',
    requires: [
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.widget.OrderTotalPanel'
    ],
    //cls: Taco.baseCSSPrefix + 'order-modal',
    config : {
        record: null,
        rowTotalColumnWidth:100,
        actionColumnWidth: 60
    },
    autoShow: true,
    destroyOnHide:true,
    width: 900,
    height: 600,
    style: "border-radius: 0.6em;border:1px solid #fff;background-color:#fff;box-shadow: 0 0.7em 3.5em rgba(0, 0, 0, 0.3);-webkit-box-shadow: 0 0.7em 3.5em rgba(0, 0, 0, 0.3);",
    border: false,
    layout: {
        type:"vbox",
        align: 'stretch'
    },
    cls: Taco.baseCSSPrefix + 'orderform-detail',
    ghost: false,
    modal:true,
    bodyStyle: {
        border: '0px',
        padding: '28px 28px 28px 28px',
        backgroundColor:"#fff"
    },
    initComponent: function (eOpts) {
        var me = this;
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.
        

        var titleTemplate = new Ext.XTemplate(
            "Order No. {orderNumber}"
        );
        
        this.title = titleTemplate.apply({
            orderNumber: this.record.get('orderNumber')
        });


        this.header = {
            xtype:"header",
            style: "padding:28px;border-bottom: 1px dashed #999691 !important;font-size: 1.25em;font-weight: normal;"
        };
        
        this.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'dirtybutton',
            text: 'Save',
            onClick: function() {
                me.save();
            }
        });

        //this.dirtyButton.setDirty(true);

        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            //dock: "bottom",
            //weight: 2,
            style: "margin: 0px 0px 0px 0px;border: 1px solid #cccccc !important; border-top-width:1px !important;padding-top:10px",
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth()
        });

        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: true,
            flex:1,
            record:this.record,
            store: this.record.itemsStore,
            autoHeight: true,
            listeners: {
                'save': {
                    fn: function () {
                        this.setLoading(true,this.body);
                    },
                    scope:this
                },
                'saveSuccess': {
                    fn: function () {
                        this.setLoading(false, this.body);
                    },
                    scope: this
                },
                'saveFailure': {
                    fn: function () {
                        this.setLoading(false, this.body);
                    },
                    scope: this
                }
            }
        });

        this.items = [
            me.detailGrid,
            me.totalRow
        ];

        this.dockedItems = [
            //this.totalRow,
            {
                xtype: 'toolbar',
                dock: 'bottom',
                weight:1,
                ui: 'footer',
                defaults: { minWidth: 100 },
                style:"padding:28px;",
                items: [
                    { xtype: 'component', flex: 1 },
                    {
                        xtype: 'action',
                        text: 'Cancel',
                        onClick: function () {
                            me.hide();
                        }
                    },
                    this.dirtyButton
                ]
            }
        ];

        //this.setLoading(true);
        
        // call the service and get a draft order entity
        
        // set the data for the grid;


        this.callParent(arguments);
    },
    
    save: function () {
        var me = this;

        Taco.app.viewPort.setLoading(true);
        this.record.saveDraftOrder({
            jsonData: {},
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.viewPort.setLoading(false);
                    
                    var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                        text: "Error saving order."
                    });
                    errorDialog.show();
                    
                    return;
                }
                
                this.record.reload();
                me.hide();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error saving tracking number.";
                
                Taco.app.viewPort.setLoading(false);
                var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                    text: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});