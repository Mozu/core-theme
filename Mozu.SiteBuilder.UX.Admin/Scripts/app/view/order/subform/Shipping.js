/**
 * @class Taco.view.order.subform.Shipping
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Shipping', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.widget.Package',
        'Taco.view.order.widget.UnPackagedItems'
    ],
    config: {
        
        // order model
        record: null,
        
        editMode:false,

        // title for the panel header
        title: 'Shipment & Shipping Information',
                
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        itemId:"orderShipping",
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function (eOpts) {
        var me = this;
        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping'].join(' ');
        
        // load up the ui sub components; wlll be called every time the record changes
        this.initUI();
        
        Ext.apply(this, {
            items: [
                me.unPackagedItems,
                me.unShippedPackages,
                me.shippedPackages
            ]
        });

        this.callParent(arguments);
    },
    initUI: function () {
        this.initUnpackagedItems();
        this.initUnshippedPackages();
        this.initshippedPackages();
    },
    initUnpackagedItems: function () {
        var me = this,
            billingContact = this.record.get("billingContact");
        
        me.unPackagedItems = Ext.create('Taco.view.order.widget.UnPackagedItems', {

            record: me.record,
            
            headerData: {
                // ui controls
                showChangeLink: true,

                // order info
                title: "Unshipped Items",
                shipmentStatus: "Partially Shipped",
                orderTotal: 65,
                shippedItemTotal: 45,
                pendingItemTotal: 20,
                shippingMethod: "FedEx 2nd Day Air",

                // billing contact info
                firstName: billingContact.firstName,
                lastName: billingContact.lastName,
                address1: billingContact.address1,
                zipCode: billingContact.zipCode,
                state: billingContact.state,
                phoneNumber: billingContact.phoneNumber,
                email: billingContact.email
            }
        });
        
        // load data;
        //var data = this.record.get("unPackagedItems");
        //me.unPackagedItems.loadData(data);

    },
    
    initUnshippedPackages:function() {
        var me = this,
            data=[],
            packages=[];

        data = this.record.get("unShippedPackages");
        
        for (var i = 0; i < data.length; i++) {
            
            var dataItem = data[i];
            var billingContact = me.record.get("billingContact");

            packages.push( Ext.create('Taco.view.order.widget.Package', {
                    record: this.record,
                    gridHidden:false,
                    packageData: dataItem,
                    headerData: {
                        // ui controls
                        showVisibilityToggle: false,
                        
                        // order info
                        title: "Package " + i,
                        shipmentStatus: dataItem.status,
                        itemTotal: dataItem.totalQuantity,
                        weight: dataItem.totalWeight,
                        shippingMethod: dataItem.shippingMethod,
                        trackingNumber: dataItem.trackingNumber,
                        
                        // billing contact info
                        firstName: billingContact.firstName,
                        lastName: billingContact.lastName,
                        address1: billingContact.address1,
                        zipCode: billingContact.zipCode,
                        state: billingContact.state,
                        phoneNumber: billingContact.phoneNumber,
                        email: billingContact.email
                    }
                })
            );
        }

        //me.packagedItemsGrid.loadData(this.record.get("packages"));
        
        me.unShippedPackages = Ext.create('Taco.core.ux.EditContainer', {
            header: true,
            title: "Unshipped Packages",
            border: true,
            margin: "80px,0px,0px,0px ",
            items: packages
        });

    },
    initshippedPackages: function() {
            var me = this,
                data=[],
                packages=[];

            data = this.record.get("shippedPackages");
        
            for (var i = 0; i < data.length; i++) {
            
                var dataItem = data[i];
                var billingContact = me.record.get("billingContact");

                
                packages.push( Ext.create('Taco.view.order.widget.Package', {
                    record: this.record,
                    gridHidden: true,
                    
                    editMode: false,

                    enableCellEditing: false,

                    enableCheckBoxSelection: false,

                    enableActionColumn: false,

                    enableToobar: true,

                    isShippedPackage: true,
                    
                    enableMoveMenu: false,

                    enableShippingMethodMenu: false,

                    enableShippingLabelButton: true,

                    enabledPackingSlipButton: true,

                    enabledRemoveButton: false,

                    enabledMarkAsShippedButton: false,


                    packageData: dataItem,
                    headerData: {
                        // ui controls
                        showVisibilityToggle: true,
                        
                        // order info
                        title: "Package",
                        shipmentStatus: dataItem.status,
                        itemTotal: dataItem.totalQuantity,
                        weight: dataItem.totalWeight,
                        shippingMethod: dataItem.shippingMethod,
                        trackingNumber: dataItem.trackingNumber,
                        shipDate: dataItem.shipDate,
                        
                        // billing contact info
                        firstName: billingContact.firstName,
                        lastName: billingContact.lastName,
                        address1: billingContact.address1,
                        zipCode: billingContact.zipCode,
                        state: billingContact.state,
                        phoneNumber: billingContact.phoneNumber,
                        email: billingContact.email
                    }
                })
                );
            }

            //me.packagedItemsGrid.loadData(this.record.get("packages"));
        
            me.shippedPackages = Ext.create('Taco.core.ux.EditContainer', {
                header: true,
                title: "Shipped Packages",
                border: true,
                margin: "80px,0px,0px,0px ",
                items: packages
            });

        },
});
