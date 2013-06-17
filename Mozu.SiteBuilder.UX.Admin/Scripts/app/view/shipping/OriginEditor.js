///**
// * @class Taco.view.shipping.OriginEditor
// */
//Ext.define('Taco.view.shipping.OriginEditor', {
//    extend: 'Ext.form.Panel',
//    requires: ['Taco.store.CountryComboBox', 'Taco.store.StateComboBox'],
//    alias: 'widget.shippingorigineditor',

//    border: false,
//    layout: {
//        type: 'table',
//        columns: 3,
//        padding: '0 0 0 0'
//    },
//    defaults: {
//        xtype: 'textfield',
//        labelAlign: 'top',
//        labelSeparator: ''
//    },

//    initComponent: function () {
//        var me = this,
//            states;

//        states = Ext.create('Taco.store.StateComboBox');

//        this.items = [{
//            name: 'address1',
//            fieldLabel: 'Address line 1',
//            width: 450,
//            colspan: 3
//        }, {
//            name: 'address2',
//            width: 450,
//            fieldLabel: 'Address line 2',
//            colspan: 3
//        }, {
//            name: 'address3',
//            width: 450,
//            fieldLabel: 'Address line 3',
//            colspan: 3
//        }, {
//            name: 'cityOrTown',
//            fieldLabel: 'City',
//            width: 210,
//            colspan: 1
//        }, {
//            name: 'stateOrProvince',
//            fieldLabel: 'State',
//            xtype: 'combo',
//            width: 120,
//            queryMode: 'local',
//            displayField: 'name',
//            valueField: 'stateCode',
//            store: states,
//            colspan: 1
//        }, {
//            name: 'postalOrZipCode',
//            fieldLabel: 'Zip code',
//            align: 'right',
//            width: 100,
//            colspan: 1
//        }];

//        this.callParent(arguments);
//    }
//});