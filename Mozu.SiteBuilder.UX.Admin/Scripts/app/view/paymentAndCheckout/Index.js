/**
 * @author Michael Speed Elder
 * @class Taco.view.paymentAndCheckout.Index
 * Defines the Payment and Checkout view, currently a submenu item of the Settings navigation
 */

Ext.define('Taco.view.paymentAndCheckout.Index', {
    extend: 'Taco.core.ux.form.Editor',
    requires: [
        'Taco.view.paymentAndCheckout.StandaloneAccordion',
        'Taco.view.paymentAndCheckout.FieldDescription',
        'Taco.view.paymentAndCheckout.RadioList'
    ],
    title: 'Payment and Checkout',
    model: 'Taco.model.PaymentAndCheckout',

    initComponent: function () {
        var me = this,
            gatewayCombobox;
       
        me.actions = [{
            xtype: 'secondarybutton',
            text: 'Cancel',
            eventName: 'cancel'
        }, {
            xtype: 'dirtybutton',
            text: 'Save',
            eventName: 'save'/*,
            listeners: {
                click: function () {
                    me.store.sync({
                        success : me.onStoreStateChange,
                        scope:me
                    });
                }
            }*/
        }];
        var store = Ext.getStore('GatewayDefinitions');
        if (store.getCount() === 0) {
            store.load();
        }
        gatewayCombobox = Ext.create('Ext.form.field.ComboBox', {
            width: 250,
            fieldLabel: 'Payment Gateway',
            labelStyle: 'margin-top: 10px',
            labelAlign: 'top',
            labelSeparator: '',
            store: store,
            queryMode: 'local',
            forceSelection: true,
            allowBlank: false,
            value: 'authorize.net',
            valueField: 'id',
            displayField: 'name',
            name: 'gatewayDefinitionId'
        });

        me.mon(
            gatewayCombobox,
            'change',
            me.updateInnerForm,
            me
        );

        me.tabs = [{
            items: [{
                xtype: 'standalone-accordion',
                opened: true,
                headerText: 'Accept Credit Cards',
                accordionHeight: 580,
                accordionContents: [{
                    xtype: 'field-description',
                    childField: gatewayCombobox,
                    descriptionTop: 30,
                    childDescription: 'Choose a credit card gateway to offer credit cards directly on your site during checkout.'
                }, {
                    xtype: 'container',
                    cls: Taco.baseCSSPrefix + 'inner-form',

                    items: [{
                        xtype: 'field-description',
                        cls: Taco.baseCSSPrefix + 'inner-form-section',
                        descriptionTop: -10,
                        childField: Ext.create('Ext.container.Container', {
                            id: 'taco-inner-form-textfields',
                            width: 250,

                            defaults: {
                                width: 250,
                                labelAlign: 'top',
                                labelSeparator: '',
                                cls: Taco.baseCSSPrefix + 'gateway-field'
                            },
                            defaultType: 'textfield',
                            items: [{
                                fieldLabel: 'API Login ID',
                                name: 'gatewayFieldVal1'
                            }, {
                                fieldLabel: 'Transaction Key',
                                name: 'gatewayFieldVal2'
                            }]
                        }),
                        childDescription: '<strong style="line-height: 2.5;">Please provide your Authorize.net account credentials.</strong><br>Fusce accumsan aliquet erat, vel bibendum erat luctus in. Vivamus vulputate mollis nibh, at auctor dui condimentum at. Donec sem diam, accumsan non venenatis a, mattis at neque. Morbi hendrerit elementum quam sed congue. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
                    }, {
                        xtype: 'container',
                        cls: Taco.baseCSSPrefix + 'inner-form-section',
                        layout: 'vbox',
                        height: 110,
                        defaultType: 'checkbox',
                        items: [{
                            xtype: 'component',
                            autoEl: 'p',
                            html: "<strong>Accepted Credit Cards</strong><br>Select the credit card types supported by your merchant account that you'd like to accept from your customers."
                        }, {
                            xtype: 'checkboxgroup',
                            id: 'taco-inner-form-checkboxes',
                            cls: Taco.baseCSSPrefix + 'supported-cards',
                            width: 400,
                            columns: 2,
                            columnWidth: "50%",
                            vertical: true,
                            defaults: {
                                name: 'supportedCards'
                            },
                            defaultType: 'checkbox',
                            items: [{
                                boxLabel: 'Visa',
                                inputValue: 'VISA'
                            }, {
                                boxLabel: 'Discover',
                                inputValue: 'DISCOVER'
                            }, {
                                boxLabel: 'MasterCard',
                                inputValue: 'MASTERCARD'
                            }, {
                                boxLabel: 'American Express',
                                inputValue: 'AMEX'
                            }]
                        }]
                    }, {
                        xtype: 'container',
                        cls: Taco.baseCSSPrefix + 'inner-form-section',
                        // autoEl: 'p',
                        // TODO - Create modal and persist selection
                        items: [{
                            xtype: 'hidden',
                            id: 'paymentProcessingFlowType',
                            // todo itemId: '',
                            name: 'paymentProcessingFlowType'
                            // , value: 'AuthorizeAndCaptureOnOrderShipment'
                            // , listeners: {
                            //     render: function () {
                            //         if( this.getValue() ) {
                            //             var el = Ext.getCmp('paymentCaptureBox').getEl();
                            //             el.setHTML('<p>' + this.getValue() + '</p>');
                            //         }
                            //     }
                            // }
                        }, {
                            xtype: 'container',
                            id: 'paymentCaptureBox',
                            items: [{
                                xtype: 'component',
                                autoEl: 'p',
                                html: '<strong>Payment Capture Settings</strong><br>'
                            }, {
                                xtype: 'component',
                                itemId: 'modal-trigger',
                                autoEl: 'div',
                                padding: '5 0 0 0',
                                html: '<span class="modal-selection-summary"></span><span style="padding-left: 12px;">(<a href="javascript:;" style="padding: 0 1px;">Change</a>)</span>',
                                listeners: {
                                    afterrender: function ( modalSelectionState ) {
                                        // *** Set summary when component renders
                                        modalSelectionState.setModalSummary( Ext.getCmp('paymentProcessingFlowType').getValue() );

                                        // *** Add click listener to create modal
                                        modalSelectionState.getEl().down('a').on({
                                            click: function () {
                                                var modal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
                                                    autoShow: true,
                                                    autoSize: true,
                                                    isValid: true,
                                                    isDirty: true,
                                                    title: 'Payment Capture Settings',
                                                    items: [{
                                                        xtype: 'form',
                                                        defaultType: 'radiolist',
                                                        items: [{
                                                            radioBoxLabel: 'Authorize at Sale, Capture at Shipping',
                                                            radioValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment',
                                                            radioName: 'paymentCaptureSettings',
                                                            radioDescription: 'Fusce accumsan aliquet erat, vel bibendum erat luctus in. Vivamus vulputate mollis nibh, at auctor dui condimentum at. Donec sem diam, accumsan non venenatis a, mattis at neque. Morbi hendrerit elementum quam sed congue. Pellentesque habitant morbi.'
                                                        }, {
                                                            radioBoxLabel: 'Authorize and Capture at Sale',
                                                            radioName: 'paymentCaptureSettings',
                                                            radioValue: 'AuthorizeAndCaptureOnOrderPlacement',
                                                            radioDescription: 'Fusce accumsan aliquet erat, vel bibendum erat luctus in. Vivamus vulputate mollis nibh, at auctor dui condimentum at. Donec sem diam, accumsan non venenatis a, mattis at neque. Morbi hendrerit elementum quam sed congue. Pellentesque habitant morbi.'
                                                        }, {
                                                            radioBoxLabel: 'Authorize and Capture at Shipping',
                                                            radioValue: 'AuthorizeAndCaptureOnOrderShipment',
                                                            radioName: 'paymentCaptureSettings',
                                                            radioDescription: 'Fusce accumsan aliquet erat, vel bibendum erat luctus in. Vivamus vulputate mollis nibh, at auctor dui condimentum at. Donec sem diam, accumsan non venenatis a, mattis at neque. Morbi hendrerit elementum quam sed congue. Pellentesque habitant morbi.'
                                                        }]
                                                    }],

                                                    listeners: {
                                                        save: function () {
                                                            var radioVal = this.down('form').getForm().getValues().paymentCaptureSettings;
                                                            Ext.getCmp('paymentProcessingFlowType').setValue( radioVal );
                                                            this.hide();
                                                            modalSelectionState.setModalSummary( radioVal );
                                                        },

                                                        afterrender: function (me) {
                                                            var currentVal = Ext.getCmp('paymentProcessingFlowType').getValue();
                                                            me.down('form').getForm().setValues({ paymentCaptureSettings: currentVal });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                },

                                setModalSummary: function ( currentVal ) {
                                    var summary = 'Change Authorize & Capture Options:';

                                    if( currentVal == 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' ) {
                                        summary = 'Authorize on Order, Capture on Shipment';
                                    }
                                    else if( currentVal == 'AuthorizeAndCaptureOnOrderShipment' ) {
                                        summary = 'Authorize and Capture on Shipment';
                                    }
                                    else if( currentVal == 'AuthorizeAndCaptureOnOrderPlacement' ) {
                                        summary = 'Authorize and Capture on Order';
                                    }

                                    this.getEl().down('.modal-selection-summary', true).innerHTML = summary;
                                }
                            }]
                        }]
                    }] // *** .inner-form end
                }] // *** accordion end
            }, {
                xtype: 'standalone-accordion',
                headerText: 'Accept PayPal',
                accordionHeight: 50,
                accordionContents: [{
                    xtype: 'box',
                    html : '~~~~~~~ Post Alpha ~~~~~~~'
                }]
            }, {
                xtype: 'standalone-accordion',
                headerText: 'Accept Check by Mail',
                accordionHeight: 50,
                accordionContents: [{
                    xtype: 'box',
                    html: '~~~~~~~ Post Alpha ~~~~~~~'
                }]
            }, {
                xtype: 'standalone-accordion',
                headerText: 'Customer Checkout Settings',
                opened: true,
                accordionHeight: 85,
                accordionContents: [{
                    xtype: 'fieldcontainer',
                    defaultType: 'radio',
                    defaults: {
                        name: 'customerCheckoutType'
                    },
                    items: [{
                        boxLabel: 'Guest Checkout with optional sign in',
                        submitValue: 'LoginOptional',
                        inputValue: 'LoginOptional'
                    }, {
                        boxLabel: 'Sign in required',
                        submitValue: 'LoginRequired',
                        inputValue: 'LoginRequired'
                    }]
                }]
            }, {
                xtype: 'standalone-accordion',
                headerText: 'Capture Customer Emails',
                // opened: true,
                accordionHeight: 50,
                accordionContents: [{
                    xtype: 'box',
                    html: '~~~~~~~ Post Alpha ~~~~~~~'
                }]
                // , accordionContents: [{
                //     xtype: 'fieldcontainer',
                //     defaultType: 'radio',
                //     defaults: {
                //         // name: 'paymentProcessingFlowType'
                //         name: 'bombardWithEmail'
                //     },
                //     items: [{
                //         boxLabel: 'Selected by default',
                //         inputValue: '1'
                //         // inputValue: 'AuthorizeAndCaptureOnOrderPlacement'
                //     }, {
                //         boxLabel: 'Unselected by default',
                //         inputValue: '2'
                //         // inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment'
                //     }, {
                //         boxLabel: 'Disable and Hide Option',
                //         inputValue: '3'
                //         // inputValue: 'AuthorizeAndCaptureOnOrderShipment'
                //     }]
                // }]
            }]
        }];

        me.callParent( arguments );

        var form = me.down('form').getForm();
        form.getFieldValues = function(dirtyOnly) {
            return this.getValues(false, dirtyOnly, false, false);
        };

        // Create the appropriate number of fields for .taco-inner-form
        // according to the active record of the combobox after its store has loaded.
        me.mon(
            gatewayCombobox.getStore(),
            'load',
            function () {
                me.updateInnerForm( gatewayCombobox, gatewayCombobox.getValue() );
                this.load( Ext.ModelManager.getModel( this.model ) );
            },
            me
        );
    },

    updateInnerForm: function ( combobox, newId ) {
        // console.log( 'updateInnerForm()', arguments, combobox.getStore(), combobox.getStore().findRecord( 'id', newId ) );

        // newId = newId || 'authorize.net';
        var store = combobox.getStore(),
            selectedRecord = store.findRecord( 'id', newId );

        if( store.isLoading() || !selectedRecord ) {
            return;
        }

        var credentials = selectedRecord.get('credentialDefinitions'),
            // supportedCards = selectedRecord.get('supportedCards'),
            textfields = Ext.getCmp('taco-inner-form-textfields'),
            checkboxes = Ext.getCmp('taco-inner-form-checkboxes'),
            children = [];

        // console.log('credentials', credentials);
        Ext.Array.forEach( credentials, function (element, index, array) {
            children[ children.length ] = { fieldLabel: element.displayName, name: 'gatewayFieldVal' + (index + 1) };
            children[ children.length ] = { xtype: 'hidden', name: 'gatewayFieldId' + (index + 1), value: element.name };
        });
        textfields.removeAll();  // *** Good thing you can't chain off of this...
        textfields.add( children );

        // children = [];
        // Ext.Array.forEach( supportedCards, function (element, index, array) {
        //     children[ children.length ] = { boxLabel: element, inputValue: element };
        // });
        // checkboxes.removeAll();
        // checkboxes.add( children );

        // *** Resize .inner-form on combobox change
        // if( this.rendered ) {
        //     pickle = this.down('standalone-accordion');
        //     // console.log('.standalone-accordion', this.down('standalone-accordion'));
        // }
    },

    onStoreStateChange: function (form) {
        var me = this,
            isDirty = me.isDirty(),
            dirtyButton = me.down('dirtybutton');

        dirtyButton.setDirty(isDirty);
    }
});