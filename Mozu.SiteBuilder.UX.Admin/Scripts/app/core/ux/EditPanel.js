/**
* @class Taco.core.ux.EditPanel
* @author Jason Cochran
* The edit panel base class
*/

    Ext.define('Taco.core.ux.EditPanel', {
        extend: 'Ext.form.Panel',
        alias: 'widget.editpanel',
        data: null,
        editMode: false,
        layout: 'form',
        bodyPadding: '5 5 0',
        required: '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',
        defaultType: 'textfield',

        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },

        edit: function (button) {
            var form = button.up('form');
            form.fireEvent('edit');
        },

        getMode: function () {
            if (this.editMode) {
                return 'textfield';
            } else {
                return 'displayfield';
            }
        },

        initComponent: function () {

            this.addEvents({
                save: true,
                cancel: true
            });

            this.callParent(arguments);
            this.loadRecord(this.data);
        },

        save: function (button) {
            console.log("Save clicked");
            var form = button.up('form');
            var record = form.getRecord();
            var values = form.getValues();

            record.set(values);

            record.save({
                callback: function () {
                    console.log("I am the callback");
                },

                success: function (model) {
                    console.log("A save happened for " + model.modelName + " ID " + model.getId());
                },

                failure: function (model) {
                    console.log("A bad thing happened when trying to save.");
                }
            });

            form.fireEvent('save', record);
        },

        cancel: function (button) {
            var form = button.up('form');
            form.fireEvent('cancel');
        }
    });