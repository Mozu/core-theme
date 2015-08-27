/**
 * @author Travis Johnson
 * @class Taco.view.option.preview.DropDown
 *
 */

    Ext.define('Taco.view.option.preview.DropDown', {
        extend : 'Ext.container.Container',
        
        optionName: 'Sizes',
        cls: 'taco-preview-area',
        
        items: [{
            xtype: 'label',
            baseCls: 'taco-label'
        }, {
            xtype: 'dataview',
            loadMask: false,
            tpl: [
                '<select name="option-preview-select">',
                '<tpl for=".">',
                    '<option value="">{value}</option>',
                '</tpl>',
                '</select>'
            ],
            itemSelector: 'option',
            store: ''
        }],

        initComponent : function() {
            var me = this;

            me.callParent(arguments);
            
            this.label = this.down('label');
            this.dataView = this.down('dataview');
            
            this.setOptionName(this.optionName);
            this.dataView.bindStore(this.store);
        },
        
        setOptionName: function (name) {
            this.label.setText('<b>Select a ' + Ext.util.Inflector.singularize(name) + '</b>:', false);
        }
    });

