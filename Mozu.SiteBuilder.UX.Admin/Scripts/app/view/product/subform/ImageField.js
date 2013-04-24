/**
 * @class Taco.view.product.subform.ImageField
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ImageField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.productimagefield',
    requires: [
        'Taco.view.fileManager.Associator'
    ],

    fieldSubTpl: [
        '<div>stuff goes here...</div>',
        '<a href="#" data-item="upload">Upload new Image</a>',
        '<a href="#" data-item="associator">Select from Associator</a>',
        '<input type="hidden" id="{id}" {inputAttrTpl} >'
    ],

    initComponent: function () {

        this.callParent(arguments);

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });


    },

    onAfterRender: function (field, eOpts) {
        var associatorEl = this.getEl().down('[data-item="associator"]');

        associatorEl.on({
            click: this.onAssociatorClick,
            scope: this
        });
    },

    onAssociatorClick: function (e) {
        e.preventDefault();

        // TODO: Pass in selected images
        this.associator = Ext.create('Taco.view.fileManager.Associator', {
            selectedItems: [],
            listeners: {
                save: this.onAssociatorSave,
                cancel: function (associator) {
                    associator.hide();
                },
                scope: this
            }
        });
    },

    setValue: function (value) {
        return this.callParent(arguments);
    },

    onAssociatorSave: function (associator, selectedRecords) {
        this.associator.hide();
        console.log(selectedRecords);
    }
});