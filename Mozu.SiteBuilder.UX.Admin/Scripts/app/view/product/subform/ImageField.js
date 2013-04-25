/**
 * @class Taco.view.product.subform.ImageField
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ImageField', {
    extend: 'Ext.container.Container',
    //extend: 'Ext.form.field.Base',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.productimagefield',
    requires: [
        'Taco.view.fileManager.Associator'
    ],
    labelAlign: 'top',
    labelSeparator: '',
    //fieldSubTpl: [
    //    '<div>stuff goes here...</div>',
    //    '<a href="#" data-item="upload">Upload new Image</a>',
    //    '<a href="#" data-item="associator">Select from Associator</a>',
    //    '<input type="hidden" id="{id}" {inputAttrTpl} >'
    //],
    


    initComponent: function () {

       
        this.callParent(arguments);
        
        this.imageView = Ext.widget({
            xtype: 'dataview',
            tpl :['<div class="taco-tileview tilesize-230px">',
                        '<tpl foreach=".">',
                            '<div><img src="{url}?size=100" /></div>', 
                            
                        '</tpl>',
            '</div>'],
            itemSelector:'img'
        });
        
        this.add([{
            html: '<div>stuff goes here...</div>' +
             '<a href="#" data-item="upload">Upload new Image</a>' +
             '<a href="#" data-item="associator">Select from Associator</a>'
        }, this.imageView]);
        
        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });
        //this.add({ html: 'foodis go' });

    },
    isEqual: function (value1, value2) {
        if (value1 == null && value2 == null) {
            return true;
        }
        if (value1 == null || value2 == null) {
            return false;
        }
        if (value1.length !== value2.length) {
            return false;
        }

        if (value1.length === 0) {
            return true;
        }
        return Ext.encode(value1) == Ext.encode(value2);

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

    //setValue: function (value) {
    //    return this.callParent(arguments);
    //},
    getValue:function() {
        return this.value;
    },

    setValue: function (value) {
        var me = this;
        me.imageView.update(value);
        return me.mixins.field.setValue.call(me, value);
    },
    onAssociatorSave: function (associator, selectedRecords) {
        this.associator.hide();
        var value = [];
        Ext.each(selectedRecords, function (record) {
            
            value.push({ url: record.get('url') });
        });
        this.setValue(value);
        console.log(selectedRecords);
    }
});