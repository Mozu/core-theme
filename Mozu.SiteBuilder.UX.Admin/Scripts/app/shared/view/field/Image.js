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
    imageMetadata: null,
    isMetadataMerged: false,
    
    initComponent: function () {
        var me = this,
            cmsFilter = [];

        this.mediaAssociationStore = Ext.create('Taco.store.MediaAssociations', {});

        if (me.imageMetadata) {
            Ext.Array.each(me.imageMetadata, function (img) {
                if (!img.cmsId) {
                    me.addUrlToMediaAssociationStore(img.id, img.url, img.alt, img.sequence);
                } else {
                    cmsFilter.push({
                        property: 'id',
                        value: img.cmsId
                    });
                }
            });
        }

        this.selectedImages = Ext.create('Taco.shared.store.Files', {
            
            listeners: {
                load: this.onSelectedImagesLoaded,
                scope:this
            }
        });

        if (cmsFilter.length > 0) {
            this.selectedImages.load({
                filters: cmsFilter
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
            store: this.mediaAssociationStore,
            tpl :[ 
                    '<tpl foreach=".">',
                        '<tpl if="isUploaded === false">',
                            '<li class="item uploading">',
                                '<div class="square">Progress {progress}%</div>',
                            '</li>',
                        '<tpl else>',
                            '<li class="item image newLoad">',
                                '<tpl if="isStoredInCms">',
                                  '<div class="square" style="background-image:url(\'{url}?size=' + this.thumbnailSize + '\')" title="{alt:htmlEncode}">',
                                '<tpl else>',
                                  '<div class="square" style="background-image:url(\'{url}\');background-size: contain;" title="{alt:htmlEncode}">',
                                '</tpl>',
                                    '<ul class="toolbar">',
                                        '<li class="drag-handle" title="Drag to Resequence">Drag</li>',
                                        '<li class="remove" title="Remove">Remove</li>',
                                        '<li class="alt-text" title="Edit Properties">Alt Text</li>',
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

        this.imageView.mon(Taco.core.util.UploadManager, 'complete', this.onSelectedImageAdded, this);

        this.uploadAction = Ext.widget({
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'Upload File',
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
            text: 'Pick from File Manager',
            scope: this,
            handler: this.onAssociatorClick
        });

        this.urlManagerAction = Ext.widget({
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'Link to URL',
            scope: this,
            handler: this.onUrlAssociatorClick
        });

        this.items = [
            this.emptyDropZone,
            this.imageView,
            this.uploadButton,
            this.uploadAction,
            { xtype: 'component', html: ' | ', autoEl: { tag: 'span' } },
            this.fileManagerAction,
            { xtype: 'component', html: ' | ', autoEl: { tag: 'span' } },
            this.urlManagerAction
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

    //security defect, but commented out due to usage for csv files
    //validateFiles: function (fileList) {
    //    var allowedMediaTypes = ['image', 'video'],
    //        invalidFiles = [];

    //    Ext.each(fileList, function (file) {
    //        var mediaType = file.type.split('/')[0];
    //        if (allowedMediaTypes.indexOf(mediaType) === -1) {
    //            invalidFiles.push(file.name);
    //        }
    //    });
    //    if (invalidFiles.length > 0) {
    //        Taco.app.fireEvent('setmessage', 'The following files are not permitted ' + invalidFiles.join(', '), 'error');
    //        return false;
    //    }
    //    return true;
    //},

    onViewAfterRender: function () {
        var id = 'ImageFieldDD-' + Ext.id(),
            me = this;

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
                me.updateFormFieldFromStore();
            }
        });
    },

    onItemClick: function (view, record, item, index, e) {
        if (Ext.fly(e.target).hasCls('remove')) {
            e.stopPropagation();
            e.preventDefault();
            this.onRemoveImageAssociation(record);
        }
        else if (Ext.fly(e.target).hasCls('alt-text')) {
            e.stopPropagation();
            e.preventDefault();
            Ext.create('Taco.shared.view.modal.ImageMetadata', {
                record: record,
                listeners: {
                    savesuccess: {
                        scope: this,
                        fn: this.updateFormFieldFromStore
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

    onUrlAssociatorClick: function () {
        
        var associator = Ext.create('Taco.shared.view.modal.ImageUrlManager', {});

        this.mon(associator, {
            savesuccess: {
                scope: this,
                fn: 'onUrlAssociatorSave'
            }
        });
        
    },

    onRemoveImageAssociation: function (record) {
        this.mediaAssociationStore.remove(record); //todo: add listener to store for removed, added?
        this.updateFormFieldFromStore();
    },

    findCmsImage: function(cmsId) {
        var foundImageIndex = this.selectedImages.findBy(function(cmsImg) {
            return (cmsId === cmsImg.get('cmsId') || cmsId === cmsImg.get('name'));
        });
        return (foundImageIndex !== -1) ? this.selectedImages.getAt(foundImageIndex) : null;
    },

    findCmsImageInAssociation: function (cmsId) {
        var foundImageIndex = this.mediaAssociationStore.findBy(function(img) {
            return (cmsId === img.get('cmsId') || cmsId === img.get('name'));
        });
        return (foundImageIndex !== -1) ? this.mediaAssociationStore.getAt(foundImageIndex) : null;
    },
    

    mergeProductMetadataWithCms: function() {
        var me = this,
            selectedImage;

        if (this.imageMetadata) {
            Ext.Array.each(this.imageMetadata, function (prodImgMetadata) {
                selectedImage = me.findCmsImage(prodImgMetadata.cmsId);
                if (selectedImage && !selectedImage.get('isMerged')) {
                    selectedImage.set('alt', prodImgMetadata.alt);
                    selectedImage.set('sequence', prodImgMetadata.sequence);
                    selectedImage.set('isMerged', true);
                }
            });
        }
    },

    onSelectedImagesLoaded: function(store, records, successful) {
        if (!successful) {
            return false;
        }
        this.mergeProductMetadataWithCms();
        this.addCmsRecordToMediaAssociation(this.selectedImages.data.items);
        return this.updateFormFieldFromStore();
    },

    onSelectedImageAdded: function (eventData) {
        this.addCmsRecordToMediaAssociation([eventData.document]);
    },

    addCmsRecordToMediaAssociation: function (records) {
        var me = this;
        Ext.Array.each(records, function (item) {

            me.mediaAssociationStore.addSorted({
                id: null,
                cmsId: item.get('cmsId'),
                isStoredInCms: true,
                isUploaded: true,
                progress: 1,
                alt: item.get('alt'),
                url: item.get('url'),
                sequence: item.get('sequence') ? item.get('sequence') : me.mediaAssociationStore.count() + 1
            });
        });
        
        this.updateFormFieldFromStore();
    },

    updateFormFieldFromStore: function() {
        var values = [];
        this.mediaAssociationStore.each(function (record) {
            values.push({
                id: record.get('id'),
                cmsId: record.get('cmsId'),
                isStoredInCms: record.get('isStoredInCms'),
                isUploaded: record.get('isUploaded') ? record.get('isUploaded') : true,
                progress: record.get('progress'),
                alt: record.get('alt'),
                url: record.get('url'),
                sequence: record.get('sequence')
            });
        }, this);
        this.updateFormField(values);
    },

    updateFormField: function(values) {
        if (values.length > 0) {
            this.emptyDropZone.hide();
            this.imageView.show();
        } else {
            this.emptyDropZone.show();
            this.imageView.hide();
        }
        return this.mixins.field.setValue.call(this, values);
    },

    //todo: figure out what to do here.
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

    onAssociatorSave: function (associator, fileManagerRecords) {
        this.selectedImages.add(fileManagerRecords);
        this.addCmsRecordToMediaAssociation(fileManagerRecords);
    },

    addUrlToMediaAssociationStore: function (id, url, alt, seq) {
        this.mediaAssociationStore.addSorted({
            id: id,
            cmsId: null,
            isStoredInCms: false,
            isUploaded: true,
            alt: alt,
            url: url,
            sequence: seq
        });
    },

    onUrlAssociatorSave: function (associator, record) {
        var existingIndex;

        if (! record.imageUrl) {
            return;
        }

        existingIndex = this.mediaAssociationStore.findBy(function (existingItem) {
            return (existingItem.get('url') && existingItem.get('url').toLowerCase() === record.imageUrl.toLowerCase());
        });
        if (existingIndex !== -1) {
            return;
        }
        this.addUrlToMediaAssociationStore(null, record.imageUrl, null, this.mediaAssociationStore.count()+1);
        this.updateFormFieldFromStore();
    },

    onDestroy: function () {
        Ext.destroy(this.associator);
        this.callParent(arguments);
    }
});