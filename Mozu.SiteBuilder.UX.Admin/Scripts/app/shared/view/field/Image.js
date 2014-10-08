/**
 * @class Taco.shared.view.field.Image
 * @author Travis Johnson
 *
 *  Note: This field does not automatically update the record when the Taco.core.ux.form.Form class executes the updateTask
 *
 *  Example Data Structure:
        var testData = [
            {"url":"/files/89/1/52ad0543-723c-4e7b-bb7a-2323a55fa97d"},
            {"url":"/files/89/1/f2f83916-3548-4a13-aade-0c9258d56c31"}
        ]        
 
    To update the record before saving add use the beforeSave method of the form to manually update the record.
    Example:       

        Ext.define('Taco.view.category.Form', {    
            extend: 'Taco.core.ux.form.Form',
            editTitle: 'Edit Category',
            createTitle: 'Create New Category',
            requires: [
                'Taco.shared.view.field.Image'
            ],
            ui: 'subform',    
            items: [
                {
                    //Note: need to update the record manually in the beforeSave class method. form.Form does not extract the value from the imageField automatically.
                    fieldLabel: 'Category Image',
                    name: 'categoryImages',
                    xtype: 'taco.imagefield',
                    width: '100%'
                } 
            ],
            beforeSave: function () {
                var me = this,
                    form = me.getForm(),
                    categoryImagesField = form.findField("categoryImages");
        
                // need to update the record manually. form.Form does not extract the value from the imageField automatically.
                me.record.set("categroryImages", categoryImagesField.getValue());
                return true;
            }
        });
 *
 */

Ext.define('Taco.shared.view.field.Image', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        'Ext.view.DragZone',
        'Ext.view.DropZone',
        'Taco.view.fileManager.Associator'
    ],
    mixins: {
        field: 'Ext.form.field.Field',
        uploadable: 'Taco.shared.util.Uploadable'
    },
    alias: ['widget.taco.imagefield'],
    labelAlign: 'top',
    labelSeparator: '',
    cls: 'taco-image-field',
    allowMulti: true,
    thumbnailSize: 150,
    filters: null,
    imageMetadata: null,
    isMetadataMerged: false,
    
    initComponent: function () {
        
        this.selectedImages = Ext.create('Taco.shared.store.Files', {

            listeners: {
                datachanged: this.onSelectedImagesDataChanged,
               
                scope:this
            }
        });

        if (this.filters) {
            this.selectedImages.load({
                filters: this.filters
                //,callback: function(images) {
                //}
            });
        }

        //this.store = Taco.core.data.StoreManager.getOrCreate('Taco.shared.store.Files');


        this.emptyDropZone = Ext.widget({
            xtype: 'component',
            cls: 'taco-image-drop-zone',
            html: 'Drag and drop images here'
        });

        this.imageDropZone = Ext.widget({
            xtype: 'component'
        });

        this.imageView = Ext.widget({
            xtype: 'dataview',
            autoEl: {
                tag: 'ul',
                cls: 'taco-image-tiles'
            },
            hidden: true,
            selectedItemCls: 'selected',
            store: this.selectedImages,
            tpl :[
                    '<tpl foreach=".">',
                        '<tpl if="isUploaded === false">',
                            '<li class="item uploading">',
                                '<div class="square">Progress {progress}%</div>',
                            '</li>',
                        '<tpl else>',
                            '<li class="item image newLoad">',
                                '<div class="square" style="background-image:url(\'{url}?size=' + this.thumbnailSize + '\')">',
                                    '<ul class="toolbar">',
                                        '<li class="drag-handle">Drag</li>',
                                        '<li class="alt-text">Alt Text</li>',
                                        '<li class="remove">Remove</li>',
                                    '</ul>',
                                '</div>',
                            '</li>',
                        '</tpl>',
                    '</tpl>',
                    '<li class="taco-image-drop">',
                        '<div class="square">Drop images here</div>',
                    '</li>'
            ],
            itemSelector: 'li.item'
        });

        this.imageView.mon(Taco.core.util.UploadManager, 'complete', this.imageView.refresh, this.imageView);

        this.uploadAction = Ext.widget({
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'upload from computer',
            scope: this,
            handler: function () {
                this.uploadButton.fileInputEl.dom.click();
            }
        });

        this.uploadButton = Ext.create('Ext.form.field.File', {
            buttonOnly: true,
            hideLabel: true,
            hidden: true,
            scope: this,
            listeners: {
                change: {
                    scope: this,
                    fn: function (fb, v) {
                        this.onUploadFile(fb.fileInputEl.dom.files);
                    }
                }
            }
        });

        this.fileManagerAction = Ext.widget({
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'upload from file manager',
            scope: this,
            handler: this.onAssociatorClick
        });

        this.items = [
            this.emptyDropZone,
            this.imageView,
            this.uploadButton,
            this.uploadAction,
            { xtype: 'component', html: ' | ', autoEl: { tag: 'span' } },
            this.fileManagerAction
        ];
       
        this.callParent(arguments);
        
        this.mon(Taco.app, 'dragenter', function(e) {
            var el = this.getEl();
            if (el) {
                el.addCls('drag-and-drop-active');
            }
        }, this);
        
        this.mon(Taco.app, 'dragleave', function(e) {
            var el = this.getEl();
            if (el) {
                el.removeCls('drag-and-drop-active');
            }
        }, this);

        this.on({
            afterrender: this.onAfterRender,
            filedrop: this.onUploadFile,
            beginupload: this.onBeginUpload,
            existingfile: this.onBeginUpload,
            scope: this
        });

        this.imageView.on({
            refresh: this.bindImageUpload,
            itemclick: this.onItemClick,
            afterrender: this.onViewAfterRender,
            scope: this
        });

        this.selectedImages.on({
            datachanged: this.bindImageUpload,
            scope: this
        });
    },

    validateFiles: function (fileList) {
        var allowedMediaTypes = ['image', 'video'],
            invalidFiles = [];

        Ext.each(fileList, function (file) {
            var mediaType = file.type.split('/')[0];
            if (allowedMediaTypes.indexOf(mediaType) === -1) {
                invalidFiles.push(file.name);
            }
        });
        if (invalidFiles.length > 0) {
            Taco.app.fireEvent('setmessage', 'The following files are not permitted ' + invalidFiles.join(', '), 'error');
            return false;
        }
        return true;
    },

    onViewAfterRender: function () {
        var id = 'ImageFieldDD-' + Ext.id();

        this.dragZone = Ext.create('Ext.view.DragZone', {
            view: this.imageView,
            ddGroup: id,
            dragText: '{0} Item{1}'
        });

        this.dropZone = Ext.create('Ext.view.DropZone', {
            view: this.imageView,
            ddGroup: id,
            indicatorCls: 'taco-image-field-drop-indicator',
            indicatorHtml:  '<ul>'
                                + '<li class="outer-circle">'
                                    + '<div class="inner-circle"></div>'
                                + '</li>'
                                + '<li class="bar"></li>'
                                + '<li class="outer-circle">'
                                    + '<div class="inner-circle"></div>'
                                + '</li>'
                            + '</ul>',
            positionIndicator: function(node, data, e) {
                var me = this,
                    view = me.view,
                    pos = me.getPosition(e, node),
                    overRecord = view.getRecord(node),
                    draggingRecords = data.records,
                    indicatorX, indicatorY, xy;

                if (!Ext.Array.contains(draggingRecords, overRecord) && (
                    pos == 'before' && !me.containsRecordAtOffset(draggingRecords, overRecord, -1) ||
                    pos == 'after' && !me.containsRecordAtOffset(draggingRecords, overRecord, 1)
                )) {
                    me.valid = true;

                    if (me.overRecord != overRecord || me.currentPosition != pos) {

                        xy = Ext.fly(node).getXY();
                        indicatorY = xy[1] - view.el.getY() - 7;
                        indicatorX = xy[0] - view.el.getX() - 11;
                        if (pos == 'after') {
                            //indicatorY += Ext.fly(node).getHeight();
                            indicatorX += 165;
                        }
                        //me.getIndicator().setWidth(Ext.fly(view.el).getWidth()).showAt(0, indicatorY);
                        me.getIndicator().showAt(indicatorX, indicatorY);
                        // Cache the overRecord and the 'before' or 'after' indicator.
                        me.overRecord = overRecord;
                        me.currentPosition = pos;
                    }
                } else {
                    me.invalidateDrop();
                }
            },

            onStartDrag: function (x,y) {

            },

            getPosition: function(e, node) {
                var x = e.getXY()[0],
                    region = Ext.fly(node).getRegion(),
                    pos;

                if ((region.right - x) >= (region.right - region.left) / 2) {
                    pos = "before";
                } else {
                    pos = "after";
                }
                return pos;
            },

            handleNodeDrop: function (data, dropRecord, position) {
                var view = this.view,
                    store = view.getStore(),
                    records = data.records,
                    index;

                data.view.store.remove(records);

                index = store.indexOf(dropRecord);
                
                if (position === 'after') {
                    index++;
                }

                store.insert(index, records);
                view.getSelectionModel().select(records);
            }
        });
    },

    onItemClick: function (view, record, item, index, e) {
        if (Ext.fly(e.target).hasCls('remove')) {
            e.stopPropagation();
            e.preventDefault();
            this.selectedImages.remove(record);
        }
        else if (Ext.fly(e.target).hasCls('alt-text')) {
            e.stopPropagation();
            e.preventDefault();
            Ext.create('Taco.shared.view.modal.ImageMetadata', {
                record: record,
                listeners: {
                    savesuccess: {
                        scope: this,
                        fn: function (imgMetadataModal, imgMetadata) {
                            this.onSelectedImagesDataChanged();
                        }
                    }
                }
            });
        }
    },

    bindImageUpload: function () {
        var me = this;

        if (!this.imageView.rendered) {
            return;
        }

        this.imageDropZoneEl = this.imageView.getEl().down('.taco-image-drop');
        

        if (!this.imageDropZoneEl || this.imageDropZoneEl.bindImageUpload) {
            return;
        }
        
        this.imageDropZoneEl.bindImageUpload = true;
    

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
        //if (!this.store.data.length && !this.store.isLoading()) {
        //    this.store.load();
        //}

        this.emptyDropZoneEl = this.emptyDropZone.getEl();

        this.emptyDropZoneEl.on({
            dragenter: function (e) {
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
        if (!value1 && !value2) {
            return true;
        }
        if (!value1 || !value2) {
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

    //isDirty:function() {
    //    var isDirty = this.mixins.field.isDirty();
    //    if (isDirty) {
    //        isDirty = this.mixins.field.isDirty();
    //    }
    //    return isDirty;
    //},

    onAssociatorClick: function () {
        
        var associator = Ext.create('Taco.view.fileManager.Associator', {});

        this.mon(associator, {
            savesuccess: {
                scope: this,
                fn: 'onAssociatorSave'
            }
        });
        
    },

    onSelectedImagesDataChanged: function () {
        var value = [];

        //merge product/category images metadata with cms file data
        if (this.imageMetadata && !this.isMetadataMerged) {
            for (var i = 0; i < this.imageMetadata.length; i++) {
                var imgMeta = this.imageMetadata[i];
                Ext.Array.every(this.selectedImages.data.items, function(selectImg) {
                    if (imgMeta.cmsId === selectImg.get('cmsId')) {
                        selectImg.set('alt', imgMeta.alt);
                        return false;
                    }
                    return true;
                });
            }
            this.isMetadataMerged = true;
        }

        this.selectedImages.each(function (record) {

            value.push({ url: record.get('url'), cmsId: record.get('cmsId'), alt: record.get('alt') });
        }, this);

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
       
        if (!value ) {
            value = [];
        }
        if (!Ext.isArray(value)) {
            value = [value];
        }
            
        Ext.each(value, function (val) {
            if (val.isModel) {
                return;
            } else {
                val.isUploaded = true;
            }
        });

        // Conditional statement prevents a stackoverflow on remove
        if (this.isEqual(Ext.Array.pluck(value, 'url'), this.selectedImages.pluck('url'))) {
            return this.mixins.field.setValue.call(this, value);
        }

        this.selectedImages.loadData(value);

        return this.onSelectedImagesDataChanged();
    },
    
    getValue:function () {
        var val = this.mixins.field.getValue.apply(this, arguments);
        if (this.allowMulti === false) {
            if (Ext.isEmpty(val)) {
                return null;
            }
            return val[0];
        }
        return val;
    },

    onAssociatorSave: function (associator, selectedRecords) {
        this.selectedImages.add(selectedRecords);
    },

    onDestroy: function () {
        Ext.destroy(this.associator);
        this.callParent(arguments);
    }
});