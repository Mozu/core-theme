/**
 * @class Taco.view.product.subform.ImageField
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ImageField', {
    extend: 'Ext.form.FieldContainer',
    mixins: {
        field: 'Ext.form.field.Field',
        uploadable: 'Taco.view.fileManager.util.Uploadable'
    },
    alias: 'widget.productimagefield',
    requires: [
        'Taco.view.fileManager.Associator'
    ],
    labelAlign: 'top',
    labelSeparator: '',
    cls: 'taco-product-image-field',
    
    initComponent: function () {
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.Files');

        this.selectedImages = Ext.create('Taco.store.Files', {
            listeners: {
                datachanged: this.onSelectedImagesDataChanged,
                scope:this
            }

            
        });

        this.emptyDropZone = Ext.widget({
            xtype: 'component',
            cls: 'taco-product-image-drop-zone',
            html: 'Drag and drop images here'
        });

        this.imageDropZone = Ext.widget({
            xtype: 'component',
        });

        this.imageView = Ext.widget({
            xtype: 'dataview',
            autoEl: {
                tag: 'ul',
                cls: 'taco-image-tiles'
            },
            store: this.selectedImages,
            tpl :[
                    '<tpl foreach=".">',
                        '<tpl if="isUploaded === false">',
                            '<li class="item uploading">Progress {progress}%</li>',
                        '<tpl else>',
                            '<li class="item image" style="background-image:url({url}?size=150)"></li>',
                        '</tpl>',
                    '</tpl>',
                    '<li class="taco-image-drop">Drop images here</li>'
            ],
            itemSelector: 'li.item'
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
            afterrender: this.onAfterRender,
            filedrop: this.onUploadFile,
            beginupload: this.onBeginUpload,
            scope: this
        });

        this.imageView.on({
            refresh: this.bindImageUpload,
            scope: this
        });

        this.selectedImages.on({
            datachanged: this.bindImageUpload,
            scope: this
        });

       

    },



    bindImageUpload: function () {
        var me = this;

        if (!this.imageView.rendered) {
            return;
        }

        window.clearInterval(this.imageUploaderInterval);

        this.imageDropZoneEl = this.imageView.getEl().down('.taco-image-drop');
        


        if (!this.imageDropZoneEl || this.imageDropZoneEl.bindImageUpload) {
            return;
        }
        
        this.imageDropZoneEl.bindImageUpload = true;
    
        console.log('get there', this.getId());

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

    onBeginUpload: function (files) {
        this.selectedImages.add(files);
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
        if (!this.store.data.length && !this.store.isLoading()) {
            this.store.load();
        }

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
                this.fireEvent('filedrop', files, e);
                this.onValidDragLeave(e, this.emptyDropZoneEl);
                this.getEl().removeCls('drag-and-drop-active');
            },
            scope: this
        });
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

  
    onSelectedImagesDataChanged: function () {
        var value = [];
        this.selectedImages.each(function (record) {
            value.push({ url: record.get('url') });
        });
        
        if (value && value.length) {
            this.emptyDropZone.hide();
            this.imageView.show();
        } else {
            this.emptyDropZone.show();
            this.imageView.hide();
        }
        
        return this.mixins.field.setValue.call(this, value);
    },
    setValue: function (value) {
       
        if (!value || !Array.isArray(value)) {
            value = [];
        }

        Ext.each(value, function (val) {
            if (val.isModel) {
                return;
            }else {
                val.isUploaded = true;
            }
        });

        this.selectedImages.loadData(value);

       

        this.onSelectedImagesDataChanged();
    },

    onAssociatorSave: function (associator, selectedRecords) {
        this.selectedImages.add(selectedRecords);
    }
});