/**
 * @class Taco.view.product.subform.ImageField
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ImageField', {
    extend: 'Ext.form.FieldContainer',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.productimagefield',
    requires: [
        'Taco.view.fileManager.Associator'
    ],
    labelAlign: 'top',
    labelSeparator: '',
    cls: 'taco-product-image-field',
    
    initComponent: function () {

        this.emptyDropZone = Ext.widget({
            xtype: 'component',
            cls: 'taco-product-image-drop-zone',
            html: 'Drag and drop images here'
        });

        this.imageDropZone = Ext.widget({
            xtype: 'component',
        })

        this.imageView = Ext.widget({
            xtype: 'dataview',
            autoEl: {
                tag: 'ul',
                cls: 'taco-image-tiles'
            },
            tpl :[
              //  '<ul class="taco-image-tiles">',
                    '<tpl foreach=".">',
                        '<li class="image" style="background-image:url({url}?size=150)"></li>',                  
                    '</tpl>',
                    '<li class="taco-image-drop">Drop images here</li>'
                //'</ul>'
            ],
            itemSelector:'li.image',
            
            update : function(htmlOrData, loadScripts, cb) {
                console.log('udpate',this.getId(), arguments);
                var me = this,
                    isData = (me.tpl && !Ext.isString(htmlOrData)),
                    el;

                if (isData) {
                    me.data = htmlOrData;
                } else {
                    me.html = Ext.isObject(htmlOrData) ? Ext.DomHelper.markup(htmlOrData) : htmlOrData;
                }

                if (me.rendered) {
                    el = me.isContainer ? me.layout.getRenderTarget() : me.getTargetEl();
                    if (isData) {
                        me.tpl[me.tplWriteMode](el, htmlOrData || {});
                    } else {
                        el.update(me.html, loadScripts, cb);
                    }
                    me.updateLayout();
                }

            }
        });

        this.uploadAction = Ext.widget({
            xtype: 'action',
            text: 'upload from computer'
        });

        this.fileManagerAction = Ext.widget({
            xtype: 'action',
            text: 'upload from file manager',
            click: this.onAssociatorClick,
            scope: this
        });

        this.items = [
            this.emptyDropZone,
            this.imageView,
            this.uploadAction,
            { xtype: 'component', html: ' | ', autoEl: { tag: 'span' } },
            this.fileManagerAction
        ];
       
        this.callParent(arguments);

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

    onAssociatorClick: function () {

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

    getValue:function() {
        return this.value;
    },

    setValue: function (value) {
        console.log('setValue bitch', this.getId(), value, this.imageView && this.imageView.rendered);
        
        // if ( this.imageView.rendered){
        //     this.imageView.update(value);
        // } else {
        //     this.imageView.on( 'afterrender', function (){  
        //         console.log(this.getEl().dom);
        //         this.update(value);
        //         console.log(this.getEl().dom);
        //     });
        // }

        this.imageView.update(value);

        if (value && value.length) {
            this.emptyDropZone.hide();
        } else {
            this.emptyDropZone.show();
        }

        if (!value || !value.length) {
            return;;
        }

        

        return this.mixins.field.setValue.call(this, value);
    },

    onAssociatorSave: function (associator, selectedRecords) {
        var value = [];
        
        this.associator.hide();
        
        Ext.each(selectedRecords, function (record) {    
            value.push({ url: record.get('url') });
        });

        this.setValue(value);
    }
});