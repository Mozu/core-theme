/**
 * @author Travis Johnson
 * @class Taco.view.option.valueEditor.TextField
 */

    Ext.define('Taco.view.option.valueEditor.TextField', {
        extend: 'Ext.container.Container',
        alias: 'widget.optionvaluetext',

        mixins: {
            field: 'Ext.form.field.Field'
        },

        defaults: {
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            name: 'valueDescription',
            enableKeyEvents: true
        },

        initComponent: function() {
            var store;

            

            
            
            store = this.option.optionValues();
            //removing retarded
            //store.removeAll();
            //console.log('boom');
            if (store.getCount() == 0) {
                store.add({ });
            }

            this.optionValue = store.getAt(0);
            
            this.items = [{
                hideLabel: true,
                emptyText: 'Example: &quot;Please provide your initials&quot;',
                value: this.optionValue.get('value'),
                name: 'optionValueDescription'
            }, {
                fieldLabel: 'Min Characters',
                name: 'optionValueMin',
                value: this.option.get('minLength')
            }, {
                fieldLabel: 'Max Characters',
                name: 'optionValueMax',
                value: this.option.get('maxLength')
            }];

            this.callParent(arguments);
            
            this.items.get(0).on({
                keyup: {
                    fn: function (field) {
                        this.optionValue.set('value', field.getValue());
                        console.log('option updated', this.option.data);
                    },
                    scope: this
                }
            });
            
            this.items.get(1).on({
                keyup: {
                    fn: function (field) {
                        this.option.set('minLength', field.getValue());
                        console.log('option updated', this.option.data);
                    },
                    scope: this
                }
            });
            
            this.items.get(2).on({
                keyup: {
                    fn: function (field) {
                        this.option.set('maxLength', field.getValue());
                        console.log('option updated', this.option.data);
                    },
                    scope: this
                }
            });
        }
    });
;