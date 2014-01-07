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
    
    title: 'Direct Ship',

    tools: null,

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
                    read: '/admin/app/shipping/carrierRatesWithConfigured'
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
        
        this.items = Taco.core.util.Common.filterNulls(this.items);

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
                title: "Pending Items",
                fulfillmentStatus: me.record.get("fulfillmentStatus"),
                orderTotal: me.record.get("totalDirectShipItems"),
                shippedItemTotal: me.record.get("itemsShipped"),
                pendingItemTotal: me.record.get("itemsNotShipped"),
                shippingMethod: me.record.get("shippingMethodName") || me.record.get("shippingMethodCode"),
                shippingMethodCode: me.record.get("shippingMethodCode"),
                shippingMethodName: me.record.get("shippingMethodName"),
                weight: me.record.get("weight"),

                // billing contact info
                firstName: billingContact.firstName,
                lastName: billingContact.lastName,
                cityOrTown: billingContact.cityOrTown,
                address1: billingContact.address1,
                postalOrZipCode: billingContact.postalOrZipCode,
                stateOrProvince: billingContact.stateOrProvince,
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
                        fulfillmentStatus: dataItem.status,
                        fulfillmentLocationCode: dataItem.fulfillmentLocationCode,
                        itemTotal: dataItem.totalQuantity,
                        packagingType: packagingTypeText,
                        weight: dataItem.weight,
                        shippingMethod: dataItem.shippingMethodName || dataItem.shippingMethodCode,                        
                        shippingMethodCode: dataItem.shippingMethodCode,
                        shippingMethodName: dataItem.shippingMethodName,
                        trackingNumber: dataItem.trackingNumber,
                        
                        // billing contact info
                        firstName: billingContact.firstName,
                        lastName: billingContact.lastName,
                        address1: billingContact.address1,
                        
                        cityOrTown: billingContact.cityOrTown,
                        postalOrZipCode: billingContact.postalOrZipCode,
                        stateOrProvince: billingContact.stateOrProvince,
                        phoneNumber: billingContact.phoneNumber,
                        email: billingContact.email
                    }
                })
            );
        }

        //me.packagedItemsGrid.loadData(this.record.get("packages"));
        
        me.unShippedPackages = Ext.create('Taco.core.ux.EditContainer', {
            header: false,
            hidden:(!data.length),
            title: "Unshipped Packages",
            cls:"package-container",
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
                    fulfillmentStatus: dataItem.status,
                    itemTotal: dataItem.totalQuantity,
                    weight: dataItem.weight,
                    shippingMethod: dataItem.shippingMethodName || dataItem.shippingMethodCode,
                    fulfillmentLocationCode: dataItem.fulfillmentLocationCode,
                    trackingNumber: dataItem.trackingNumber,
                    shipDate: dataItem.shipDate,
                    packagingType : packagingTypeText,
                        
                    // billing contact info
                    firstName: billingContact.firstName,
                    lastName: billingContact.lastName,
                    cityOrTown: billingContact.cityOrTown,
                    address1: billingContact.address1,
                    postalOrZipCode: billingContact.postalOrZipCode,
                    stateOrProvince: billingContact.stateOrProvince,
                    phoneNumber: billingContact.phoneNumber,
                    email: billingContact.email
                }
            })
            );
        }

        //me.packagedItemsGrid.loadData(this.record.get("packages"));
        
        me.shippedPackages = Ext.create('Taco.core.ux.EditContainer', {
            header: false,
            hidden: (!data.length),
            title: "Shipped Packages",
            cls: "package-container",
            items: packages
        });
    },
    
    onRecordChange: function () {
        var me = this;
        
        Ext.suspendLayouts();

        // clear out the ui components
        if (me.unpackagedItems) {
            me.unpackagedItems.destroy();
            me.unpackagedItems = null;
        }

        if (me.unShippedPackages) {
            me.unShippedPackages.destroy();
            me.unShippedPackages = null;
        }

        if (me.shippedPackages) {
            me.shippedPackages.destroy();
            me.shippedPackages = null;
        }

        //re-build the ui components
        me.initUI();

        // add the ui components to the view after filtering out any that are null;
        me.add(
            Taco.core.util.Common.filterNulls([
                me.unpackagedItems,
                me.unShippedPackages,
                me.shippedPackages
            ])
        );
        
        Ext.resumeLayouts(true);
        Taco.app.viewPort.setLoading(false);
    }
});
