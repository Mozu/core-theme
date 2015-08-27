/**
 * @class Taco.view.order.subform.InstorePickup
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.InstorePickup', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.PickupItemGrid',
        'Taco.view.order.widget.PackagePickup',
        'Taco.view.order.widget.UnpickedupItems'
    ],
    
    title: 'In Store Pickup',
    // override the bodyPadding from editContainer class.
    bodyPadding: '0 0 19 0',

    tools: null,

    config: {
        
        // order model
        record: null,
        
        editMode:false,
                
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        itemId:"orderInstorePickup"
    },
    
    initComponent: function (eOpts) {
        var me = this;
        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping'].join(' ');

        me.packagingTypeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PackagingTypes'
        });
        
        
        // after the record is reloaded we will need to refresh the ui
        this.mon(this.record,"aftercommit", function () {
            this.onRecordChange();
        }, this);

        // load up the ui sub components; wlll be called every time the record changes
        this.initUI();
        


        

        Ext.apply(this, {
            items: [
                me.unpackagedItems,
                me.pendingPickups,
                me.pickedupPackages
            ]
        });
        
        this.items = Taco.core.util.Common.filterNulls(this.items);

        this.callParent(arguments);
    },
    initUI: function () {
        this.initUnpackagedItems();
        this.initPendingPickups();
        this.initPickedupPackages()
    },
    initUnpackagedItems: function () {
        var me = this,
            billingContact = this.record.get("billingContact");

        me.unpackagedItems = Ext.create('Taco.view.order.widget.UnpickedupItems', {

            record: me.record,
            
            headerData: {
                // ui controls
                showChangeLink: true,

                // order info
                title: "Pending Items",
                fulfillmentStatus: me.record.get("fulfillmentStatus"),
                orderTotal: me.record.get("totalPickupItems"),                
                totalPickupItems: me.record.get("totalPickupItems"),
                itemsPickedup: me.record.get("itemsPickedup"),
                itemsNotPickedup: me.record.get("itemsNotPickedup"),
                

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
        
        
    },
    
    initPendingPickups:function() {
        var me = this,
            data=[],
            packages=[];

        data = this.record.get("pendingPickups");
        
        if (data.length) {
            
        

            for (var i = data.length; i > 0; i--) {
            
                var dataItem = data[i-1];
                var billingContact = me.record.get("billingContact");
    
                packages.push(Ext.create('Taco.view.order.widget.PackagePickup', {
                        record: this.record,
                        gridHidden:false,
                        packageData: dataItem,
                        headerData: {
                            // ui controls
                            showVisibilityToggle: false,
                        
                            // order info
                            title: "Pickup " + i,
                            fulfillmentStatus: dataItem.status,
                            fulfillmentLocationCode: dataItem.fulfillmentLocationCode,
                            itemTotal: dataItem.totalQuantity,    
                            weight: dataItem.weight,
                        
                            changeMessages: dataItem.changeMessages,
                        
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
        
            me.pendingPickups = Ext.create('Taco.core.ux.EditContainer', {
                header: false,
                title: "Packages Awaiting Pickup",
                cls:"package-container",
                items: packages
            });
            
        }
    },
    
    initPickedupPackages: function() {
        var me = this,
            data=[],
            packages=[];

        data = this.record.get("pickedupPackages");
        
        if (data.length) {
            



            for (var i = 0; i < data.length; i++) {
            
                var dataItem = data[i];
                var billingContact = me.record.get("billingContact");
    
               
                packages.push( Ext.create('Taco.view.order.widget.PackagePickup', {
                    record: this.record,
                    gridHidden: true,
                    
                    editMode: false,

                    enableCellEditing: false,

                    enableCheckBoxSelection: false,

                    enableActionColumn: false,

                    enableToobar: true,

                    isPickedupPackage: true,
                    
                    enableMoveMenu: false,

                    enableShippingMethodMenu: false,

                    enableShippingLabelButton: true,

                    enabledPackingSlipButton: true,

                    enabledRemoveButton: false,

                    enabledMarkAsFulfilledButton: false,


                    packageData: dataItem,
                    headerData: {
                        // ui controls
                        showVisibilityToggle: true,
                        
                        // order info
                        title: "Pickup",
                        fulfillmentStatus: dataItem.status,
                        fulfillmentDate: dataItem.fulfillmentDate,
                        fulfillmentLocationCode: dataItem.fulfillmentLocationCode,
                        itemTotal: dataItem.totalQuantity,
                        weight: dataItem.weight,

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
        
            me.pickedupPackages = Ext.create('Taco.core.ux.EditContainer', {
                header: false,
                title: "Fulfilled Pickups",
                cls: "package-container",
                items: packages
            });
            
        }
    },
    
    onRecordChange: function () {
        var me = this;
        
        Ext.suspendLayouts();

        // clear out the ui components
        if (me.unpackagedItems) {
            me.unpackagedItems.destroy();
            me.unpackagedItems = null;
        }

        if (me.pendingPickups) {
            me.pendingPickups.destroy();
            me.pendingPickups = null
        }

        if (me.pickedupPackages) {
            me.pickedupPackages.destroy();
            me.pickedupPackages = null
        }

        //re-build the ui components
        me.initUI();

        // add the ui components to the view
        me.add(
            Taco.core.util.Common.filterNulls([
                me.unpackagedItems,
                me.pendingPickups,
                me.pickedupPackages
            ])
        );


        
        Ext.resumeLayouts(true);
        Taco.app.viewPort.setLoading(false);
    }
});
