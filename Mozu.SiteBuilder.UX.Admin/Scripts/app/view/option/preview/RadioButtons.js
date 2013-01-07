/**
 * @author Travis Johnson
 * @class Taco.view.option.preview.RadioButtons
 */


    Ext.define('Taco.view.option.preview.RadioButtons', {
        extend: 'Ext.container.Container',

        optionName: 'Sizes',
        cls: 'taco-preview-area',

        items: [{
            xtype: 'label',
            baseCls: 'taco-label'
        }, {
            xtype: 'dataview',
            loadMask: false,
            tpl: [
                '<tpl for=".">',
                    '<label>',
                        '<input type="radio" value="radiobutton" name="option-preview-radio"> {value}',
                    '</label>',
                '</tpl>'
            ],
            itemSelector: 'label',
            store: ''
        }],

        initComponent: function() {
            this.callParent(arguments);

            this.label = this.down('label');
            this.dataView = this.down('dataview');
            
            this.setOptionName(this.optionName);
            this.dataView.bindStore(this.store);
        },

        setOptionName: function(name) {
            this.label.setText('<b>Select a ' + Ext.util.Inflector.singularize(name) + '</b>:', false);
        }
    });
