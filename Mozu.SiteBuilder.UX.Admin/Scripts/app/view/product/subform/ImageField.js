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
            xtype: 'complexdataview',
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
            itemSelector:'li.image'
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
        
        Taco.app.on({
            dragenter: function (e) {
                this.getEl().addCls('drag-and-drop-active');
            },
            dragleave: function (e) {
                this.getEl().removeCls('drag-and-drop-active');
            },

            drop: function (e) {
                
            },
            scope: this
        })

        this.on({
            afterrender: function () {
                this.emptyDropZoneEl = this.emptyDropZone.getEl();

                this.emptyDropZoneEl.on({
                    dragenter: function (e) {;
                        this.onValidDragEnter(e, this.emptyDropZoneEl);
                    },
                    dragleave: function (e) {
                        this.onValidDragLeave(e, this.emptyDropZoneEl);
                    },
                    drop: function (e) {
                        var files = e.browserEvent.dataTransfer.files;
                        e.stopPropagation();
                        e.preventDefault();
                        this.fireEvent('filedrop', files);
                        this.onValidDragLeave(e, this.emptyDropZoneEl);
                        this.getEl().removeCls('drag-and-drop-active');
                    },
                    scope: this
                });
            },
            scope: this
        });

        this.imageView.on({
            afterupdate: function () {
                this.imageDropZoneEl = this.imageView.getEl().down('.taco-image-drop');
                if (!this.imageDropZoneEl) {
                    return;
                }
                this.imageDropZoneEl.on({
                    dragenter: function (e) {
                        this.onValidDragEnter(e, this.imageDropZoneEl);
                    },
                    dragleave: function (e) {
                        this.onValidDragLeave(e, this.imageDropZoneEl);
                    },
                    drop: function (e) {
                        var files = e.browserEvent.dataTransfer.files;
                        e.stopPropagation();
                        e.preventDefault();
                        this.fireEvent('filedrop', files);
                        
                        this.onValidDragLeave(e, this.imageDropZoneEl);
                        this.getEl().removeCls('drag-and-drop-active');
                    },
                    scope: this
                });
            },
            scope: this
        })

    },

    onValidDragEnter: function (e, el) {
        el.addCls('drag-over');
        Taco.app.DragDropZone.allowDrop();
    },

    onValidDragLeave: function (e, el) {
        el.removeCls('drag-over');
        Taco.app.DragDropZone.disallowDrop();
    },

    onAfterRender: function () {
        this.emptyDropZoneEl = this.emptyDropZone.getEl();
        //this.fileDropZoneEl = this.imageView.getEl().down('.taco-image-drop');

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
        
        if ( this.imageView.rendered){
            this.imageView.update(value);
        } else {
            // TODO: Need to do a proper fix, some weird race condition where the view gets messed up. Ask Thom
            this.imageView.on({
                afterrender: function () {
                    Ext.defer(function () {
                        this.imageView.update(value);
                    }, 10, this);
                },
                scope: this
            });
            
        }

        if (value && value.length) {
            this.emptyDropZone.hide();
            this.imageView.show();
        } else {
            this.emptyDropZone.show();
            this.imageView.hide();
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