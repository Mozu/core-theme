/**
 * @class Taco.view.testing.EditAddressTest
 */
    Ext.define('Taco.view.testing.EditAddressTest', {
        extend: 'Taco.core.ux.content.Container',
        requires: ['Taco.core.ux.modal.Helper','Taco.model.Address','Taco.view.address.AddressForm'],
        header: {
            title: 'edit address'
        },
        body: {
            items: [{
                xtype: 'action',
                text: 'edit address',
                listeners: {
                    click: function () {

                        // this test class is being used while the AddressForm is being built. kthxbai

                        var record = Ext.create('Taco.model.Address', {
                            firstName: 'Raymond',
                            middleNameOrInitial: 'K.',
                            lastName: 'Hessel',
                            address1: '1320 South East spanning',
                            address2: 'Apt A',
                            cityOrTown: 'Austin',
                            stateOrProvince: 'TX',
                            countryCode: 'US',
                            postalOrZipCode: '78759',
                            phoneNumber: '512-123-8888',
                            companyOrOrganization: 'veteranarian'
                        });

                        Ext.create('Taco.core.ux.modal.Helper', {
                            form: {
                                editors: ['Taco.view.address.AddressForm'],
                                record: record
                            }
                        });
                    }
                }
            }]
        },
        initComponent: function (eOpts) {
            this.callParent(arguments);
        }
    });
