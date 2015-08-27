/**
 * @class Taco.core.ux.form.BackgroundImagePicker
 */

Ext.define('Taco.core.ux.form.BackgroundImagePicker', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.backgroundimagepicker',
    requires: ['Taco.shared.view.field.Image'],

    initComponent: function () {
        this.items = [{
            xtype: 'imagefield',
            name: 'background-image',
            listeners: {
                change: function () {
                    console.log('field change');
                },
                scope: this
            }
        }, {
            xtype: 'selectfield',
            fieldLabel: 'Size',
            name: 'background-size',
            store: [
                'auto',
                'cover'
            ]
        }, {
            xtype: 'selectfield',
            fieldLabel: 'Position',
            name: 'background-position',
            store: [
                'left top',
                'left center',
                'left bottom',
                'right top',
                'right center',
                'right bottom',
                'center top',
                'center center',
                'center bottom'
            ]
        }, {
            xtype: 'selectfield',
            fieldLabel: 'Repeat',
            name: 'background-repeat',
            store: [
                'no-repeat',
                'repeat',
                'repeat-x',
                'repeat-y'
            ]
        }, {
            xtype: 'selectfield',
            fieldLabel: 'Attachment',
            name: 'background-attachment',
            store: [
                'fixed',
                'scroll'
            ]
        }];

        this.callParent(arguments);

        this.on({
            afterrender: function () {
                console.log(this.value);
                this.getForm().setValues(this.value);
                this.relayEvents(this, ['change'], 'background');
            },
            scope: this
        });
    }
});