/**
 * @class Taco.view.order.subform.Shipping
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Shipping', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ShippingItemGrid',
        'Taco.view.order.widget.Package',
        'Taco.view.order.widget.UnpackagedItems',
        'Taco.store.PackagingTypes'
    ],
    
    title: 'Shipment & Shipping Information',

    tools: [{
        type: 'gear',
        menu: {
            plain: true,
            shadow: false,
            items: []
        }
    }],

    config: {
        
        // order model
        record: null,
        
        editMode:false,
                
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        itemId:"orderShipping"
    },
    
    initComponent: function (eOpts) {
        var me = this;
        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping'].join(' ');

        me.packagingTypeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PackagingTypes'
        });
        
        




        // load the shipping rates data for use in the shipping packages
        Ext.namespace('Taco.properties');
        Taco.properties.shippingRates = Taco.core.data.StoreManager.getOrCreate({
            model: 'Taco.model.KeyValuePair',
            autoLoad: true,
            pageSize: 500,
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/shipping/carrierRates'
                },
                reader: {
                    
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: 'message'
                }
            }
        });

        // after the record is reloaded we will need to refresh the ui
        this.record.on("aftercommit", function () {
            this.onRecordChange();
        }, this);

        // load up the ui sub components; wlll be called every time the record changes
        this.initUI();
        
        Ext.apply(this, {
            items: [
                me.unpackagedItems,
                me.unShippedPackages,
                me.shippedPackages
            ]
        });

        this.callParent(arguments);
    },
    initUI: function () {
        this.initUnpackagedItems();
        this.initUnshippedPackages();
        this.initShippedPackages();
    },
    initUnpackagedItems: function () {
        var me = this,
            billingContact = this.record.get("billingContact");

        me.unpackagedItems = Ext.create('Taco.view.order.widget.UnpackagedItems', {

            record: me.record,
            
            headerData: {
                // ui controls
                showChangeLink: true,

                // order info
                title: "Unshipped Items",
                shipmentStatus: me.record.get("shippingStatus"),
                orderTotal: me.record.get("itemsOrdered"),
                shippedItemTotal: me.record.get("itemsShipped"),
                pendingItemTotal: me.record.get("itemsNotShipped"),
                shippingMethod: me.record.get("shippingMethodName") || me.record.get("shippingMethodCode"),
                weight: me.record.get("weight"),

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
        //var data = this.record.get("unpackagedItems");
        //me.unpackagedItems.loadData(data);

    },
    
    initUnshippedPackages:function() {
        var me = this,
            data=[],
            packages=[];

        data = this.record.get("unShippedPackages");
        
        for (var i = data.length; i > 0; i--) {
            
            var dataItem = data[i-1];
            var billingContact = me.record.get("billingContact");
            var packagingType = dataItem.packagingType;
            var packagingTypeText = me.packagingTypeStore.getById(packagingType).get("text");
            
            packages.push(Ext.create('Taco.view.order.widget.Package', {
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
                        packagingType: packagingTypeText,
                        weight: dataItem.weight,
                        shippingMethod: dataItem.shippingMethodName || dataItem.ShippingMethodCode,
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
    initShippedPackages: function() {
        var me = this,
            data=[],
            packages=[];

        data = this.record.get("shippedPackages");
        
        for (var i = 0; i < data.length; i++) {
            
            var dataItem = data[i];
            var billingContact = me.record.get("billingContact");
            var packagingType = dataItem.packagingType;
            var packagingTypeText = me.packagingTypeStore.getById(packagingType).get("text");
                
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
                    weight: dataItem.weight,
                    shippingMethod: dataItem.shippingMethod,
                    trackingNumber: dataItem.trackingNumber,
                    shipDate: dataItem.shipDate,
                    packagingType : packagingTypeText,
                        
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

    onRecordChange: function () {
        var me = this;
        
        Ext.suspendLayouts();

        // clear out the ui components
        me.unpackagedItems.destroy();
        me.unShippedPackages.destroy();
        me.shippedPackages.destroy();

        //re-build the ui components
        me.initUI();

        // add the ui components to the view
        me.add(
            me.unpackagedItems,
            me.unShippedPackages,
            me.shippedPackages
        );
        
        Ext.resumeLayouts(true);
        Taco.app.viewPort.setLoading(false);
    }
});
