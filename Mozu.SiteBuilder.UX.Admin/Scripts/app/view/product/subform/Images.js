/**
 * @class Taco.view.product.subform.Images
 */

Ext.define('Taco.view.product.subform.Images', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productimagessubform',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.images,
    bodyPadding: '10 0 0 0',
    requires: [
        'Taco.view.product.images.imageGroupGrid.Grid',
        'Taco.view.product.images.ImageGroupEditor',
        'Taco.shared.view.field.Image'
    ],

    initComponent: function() {
        var me = this;
        me.dirtyCounter = 0;

        this.record = this.product;
        var product = (me.isGlobal || typeof me.isGlobal === "undefined") ? me.product : me.productInCatalogInfo;

        this.enableBubble('resetImages');

        var attributeValuesMap = {};


        this.hasOverriddenContent =  function(){
            if(me.isGlobal && me.product.get('productInCatalogs')) {
                var hasOverriddenContent = false;
                if(me.product.get('productInCatalogs').length) {
                    me.product.get('productInCatalogs').forEach(function(catalog){
                        if (catalog.isContentOverridden) {
                            hasOverriddenContent = true;
                            return false;
                        }
                    });
                } else {
                    if (product.get('productInCatalogs').isContentOverridden) {
                        hasOverriddenContent = true;
                    }
                }

                return hasOverriddenContent;
            }
            return false;
        }

       

        if(me.product.getOptions()) {
            me.product.getOptions().each(function(item) {
                var found = me.record.productTypeRecord.get('options').find(function(option) {
                    return option.attributeFQN === item.get('attributeFQN');
                });
    
                item.set('name', found.adminName);
            })
        }


        if (this.product.data.options) {
            this.product.data.options.forEach(function(option) {
                var foundFQN = me.record.productTypeRecord.data.options.find(function(rec) {
                    return rec.attributeFQN === option.attributeFQN;
                });

                attributeValuesMap[option.attributeFQN] = option.values.map(function(val) {
                    var foundValue = foundFQN.selectedValues.find(function(selectedValue) {
                        return selectedValue.id == val;
                    });

                    return [foundValue.id, foundValue.value];
                })
            });
        }

        this.record.productTypeAttributes = attributeValuesMap;

        var activeOption = function() {
            return me.record.get('options').find(function(attribute) {
                return attribute.isProductImageGroupSelector;
            });
        }

        var initActiveOption = activeOption();

        this.addImageGroupButton = Ext.widget({
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            text: Localizer.langResources.CATALOG.Products.ProductEdit.create_image_group,
            itemId: 'addImageGroupButton',
            scope: me,
            hidden: initActiveOption === undefined,
            margin: '0 0 15 10',
            padding: '10 25',
            style: { "float": 'right' },
            handler: function() {
               me.createPopup(null, true);
            },
            hidden: true,
            disabled: !this.isGlobal
        });

        this.imageGroupGrid = Ext.create('Taco.view.product.images.imageGroupGrid.Grid', {
            hideSubnavLinks: true,
            margin: '30 0 20 0',
            useWhiteContainer: true,
            viewConfig: {
                deferEmptyText: true,
                emptyText: me.record.phantom ? Localizer.langResources.CATALOG.Products.ProductEdit.create_image_group + ' ' : Localizer.langResources.CATALOG.Products.ProductEdit.none_available
            },
            hideNavMenu: true,
            isCatalogLevel: true,
            isPopUp: true,
            pageSize: 50,
            minHeight: 150,
            hidden: initActiveOption === undefined,
            onItemClick: this.onImageGroupItemClick.bind(me),
            onItemDelete: this.onImageGroupDelete.bind(me),
            hidden: true,
            productInCatalogInfo: me.productInCatalogInfo,
            isGlobal: this.isGlobal
        });

        this.imagesField = Ext.widget({
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_images,
            xtype: 'taco.imagefield',
            width: '100%',
            margin: '0 0 20 15',
            imageMetadata: product.get('productImages'),
            onValueChanged: function(value) {
                var defaultImages = product.get('productImages').filter(function(image) {
                    return image.productImageGroupId === undefined || image.productImageGroupId === 'default';
                });    
                
                var remove = {};
                var add = [];

                Ext.Array.forEach(defaultImages, function(image) {
                    var found = value.find(function(item) {
                        return item.cmsId === image.cmsId;
                    });

                    if (!found) {
                        remove[image.cmsId] = true;
                    }
                });
                
                Ext.Array.forEach(value, function(image, idx) {
                    image.productImageGroupId = 'default';
                    image.sequence = idx;

                    var found = defaultImages.find(function(item) {
                        if (item.cmsId === image.cmsId) {
                            Ext.Object.merge(item, image);
                        }
                        return item.cmsId === image.cmsId;
                    });
                
                    if (!found) {
                        add.push(image);
                    }
                });

                var filteredImages = product.get('productImages').filter(function(image) {
                    return !remove[image.cmsId];
                }).concat(add);
                
                var orderedImages = [];
                Ext.Array.forEach(filteredImages, function(image, idx) {
                    orderedImages.splice(image.sequence, 0, image);
                });

                product.set('productImages', orderedImages);
                product.set('_override', {productImages: filteredImages});
            }
        });

        this.useImageGroupsCheckbox = Ext.create('Ext.form.field.Checkbox', {
            
            boxLabel: Localizer.langResources.CATALOG.Products.ProductEdit.assign_images_to_options,
            margin: '0 0 20 15px',
            width: '100%',
            disabled: !this.isGlobal,
            handler: function() {
                var self = this;
                var toggleImageOptions = function() {
                    me.productTypeOptions.setVisible(self.checked);
                    me.imagesField.setVisible(!self.checked);
                    me.imageGroupGrid.setVisible(self.checked);
                    me.addImageGroupButton.setVisible(self.checked);

                    if (!self.checked) {
                        // loop through image groups and set each group is isProductImageGroupSelector = false
                        Ext.Array.forEach(me.record.get('options'), function(attribute) {
                            attribute.isProductImageGroupSelector = false;
                        });

                        Ext.Array.forEach(me.product.get('options'), function(attribute) {
                            attribute.isProductImageGroupSelector = false;
                        });

                        // update images if changes were made in ImageGroupSelector
                        var defaultImages = product.get('productImages').filter(function(image) {
                            return image.productImageGroupId === 'default'
                        });
                        me.imagesField.setValue(defaultImages);
                    }
                }

                if(me.hasOverriddenContent()){
                    me.fireEvent('resetImages', {
                        message: Localizer.langResources.CATALOG.Products.ProductEdit.change_product_group_msg,
                        callback: toggleImageOptions
                    });
                    return;
                }

                toggleImageOptions();
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'use-prod-image-groups',
                hoverTarget: 'label',
                messageKey: 'product.images.useProductImageGroups',
                offsetLeft: 20,
                offsetTop: 15
            })
        });

        
        this.productTypeOptions = Ext.widget({
            xtype: 'selectfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.selected_option,
            width: '50%',
            allowBlank: true,
            margin: '20 0 0 15px',
            queryMode: 'local',
            store: this.product.getOptions(),
            displayField: 'name', 
            valueField: 'attributeFQN',
            name:'productTypeOption',
            hidden: initActiveOption === undefined,
            disabled: !this.isGlobal,
            value: (initActiveOption) ? initActiveOption.attributeFQN: null,
            listeners: {

                beforeselect: function(combo, record, index, eOpts){
                    var me = this;
                    var value = record.get('attributeFQN');
                    var store = me.product.getOptions();

                    var setNewOption = function(canceled) {
                        if(canceled) {
                            combo.ownerLayout.redoLayout();
                            return false
                        }

                        combo.setValue(value);
                        store.each(function(attribute) {
                            attribute.set('isProductImageGroupSelector', attribute.get('attributeFQN') === value)
                        });
    
                        me.imageGroupGrid.setVisible(value !== null);
                        me.addImageGroupButton.setVisible(value !== null);
                        var gridEntries = me.getGridEntries.call(me, value);
    
                        if(value !==null && gridEntries.length === 0) {
                            var defaultGroup = {
                                groupName: "default",
                                optionValues: []
                            };
                            product.get('productImageGroups').push({
                                productImageGroupId: "default",
                                productImageGroupTags: []
                            })
                            gridEntries.push(defaultGroup)
                        }
                        me.imageGroupGrid.store.loadData(gridEntries);
                    };

                    if(me.hasOverriddenContent()) {
                        me.fireEvent('resetImages', {
                            message: Localizer.langResources.CATALOG.Products.ProductEdit.remove_product_group_msg,
                            callback: setNewOption
                        });
                        return false;
                    };
                    setNewOption();
                    return true;
                },
                scope: this
            }
        });

      
        var defaultImages = product.get('productImages').filter(function(image) {
            return image.productImageGroupId === 'default'
        });

        me.imagesField.setValue(defaultImages);

        this.items = [
            this.useImageGroupsCheckbox,
            this.productTypeOptions,
            this.addImageGroupButton,
            this.imageGroupGrid,
            this.imagesField
        ];

        var setIntiGridState = function(){
            var attributeFQN = (initActiveOption) ? initActiveOption.attributeFQN : null,
                gridEntries = me.getGridEntries.call(me, attributeFQN);

            me.imageGroupGrid.setVisible(attributeFQN !== null);
            me.addImageGroupButton.setVisible(attributeFQN !== null);
            me.useImageGroupsCheckbox.setValue(attributeFQN !== null);
            me.imagesField.setVisible(attributeFQN == null);

            if(attributeFQN) {
                me.imageGroupGrid.store.loadData(gridEntries);
            }
        };
        
        setIntiGridState();

        this.callParent(arguments);
        this.updateFieldVisibility();

        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
            me.mon(productForm, 'resetImagesComplete', me.createPopup, me);
        });

        me.on('resetFormImages', function(options){
            product.set('productImages', options.images.slice());
            var defaultImages = product.get('productImages').filter(function(image) {
                return image.productImageGroupId === 'default'
            });
    
            me.imagesField.setValue(defaultImages)

            if(options.groupFqn) {
                Ext.Array.forEach(me.record.get('options'), function(attribute) {
                    attribute.isProductImageGroupSelector = attribute.attributeFQN === options.groupFqn;
                });
                var gridEntries = me.getGridEntries.call(me, options.groupFqn);
                me.imageGroupGrid.store.loadData(gridEntries);
            }

            if (activeOption()) {
                // Check the checkbox
                me.useImageGroupsCheckbox.setValue(true);
                
                // Set dropdown value
                me.productTypeOptions.setValue(activeOption().attributeFQN);
            } else {
                me.useImageGroupsCheckbox.setValue(false);
            }
            
        })
    },

    getGridEntries: function(fqn) {
        var entries = [];
        var product = this.product

        if (!product.get('productImageGroups')) {
            return entries;
        }
        
        product.get('productImageGroups').forEach(function(group) {
            if(group){
                var tagEntry = group.productImageGroupTags && group.productImageGroupTags.find(function(tag) {
                    return tag.fqn === fqn;
                });

                if (group.productImageGroupId === 'default') {
                    entries.push({
                        groupName: 'default',
                        optionValues: []
                    });
                } else if (tagEntry) {
                    entries.push({
                        groupName: group.productImageGroupId,
                        optionValues: tagEntry.values
                    });
                }
            }
        });

        return entries;
    },

    onImageGroupItemClick: function(cmp, record) {
        if (event && event.target.getAttribute('role') === 'button') {
            return;
        }

        this.createPopup(record, false);
    },

    onImageGroupDelete: function(cmp, record) {

        var product = this.product;
        var self = this;

        var deleteGroup = function() {
           
            product.set('productImageGroups', product.get('productImageGroups').filter(function(group) {
                return group.productImageGroupId !== record.data.groupName;
            }));
    
            var removeIdx = self.imageGroupGrid.store.find('groupName', record.data.groupName);
            self.imageGroupGrid.store.removeAt(removeIdx);
    
            self.dirtyCounter += 1;
            self.productForm.findField('dirtyControl').setValue(self.dirtyCounter);

            // delete all associated images from the product record
            product.set('productImages', product.get('productImages').filter(function(image) {
                return image.productImageGroupId !== record.data.groupName;
            }));

            //This is stuid, why are we using _override in the first place?
            if(product.get('_override')){
                if(product.get('_override').productImages)
                {
                    product.set('_override', { 
                        productImages: Ext.Array.filter(product.get('_override').productImages, function(image) {
                            return image.productImageGroupId !== record.data.groupName;
                        })
                    })   
                }
            }
           
        }
        
        if(self.hasOverriddenContent()){
            self.fireEvent('resetImages', {
                message: Localizer.langResources.CATALOG.Products.ProductEdit.delete_product_group_msg,
                callback: deleteGroup
            });
            return;
        }

        deleteGroup();
       
    },

    onDestroy: function() {
        this.callParent(arguments);
    },

    onProductUsageChange: function (view, value) {
        var me = this;
        this.updateFieldVisibility();
    },

    updateFieldVisibility: function() {
        var me = this;
        if (this.product.data) {

            var productImageOptionsVisibility = this.product.data.productUsage == 'Configurable';

            this.useImageGroupsCheckbox.setVisible(productImageOptionsVisibility);
        }
    }, 

    createPopup: function(record, isNew) {
        var me = this;

        Ext.create('Taco.view.product.images.ImageGroupEditor', {
            attributes: this.record.productTypeAttributes[
                this.productTypeOptions.value
            ],
            record: record,
            product: me.product,
            productInCatalogInfo: me.productInCatalogInfo,
            parentForm: this,
            isCreateMode: isNew,
            isGlobal: this.isGlobal,
            listeners: {
                savesuccess: function(editor) {
                    var product = (me.isGlobal || typeof me.isGlobal === "undefined") ? me.product : me.productInCatalogInfo
                    var values = editor.form.getValues();
                    
                    var store = me.imageGroupGrid.store;

                    if (editor.isCreateMode) {
                        store.add({
                            groupName: values.groupName,
                            optionValues: values.optionValues
                        });
                    }

                    // If group name already exists under another option value,
                    // then just add a new tag. Otherwise, add new entry to image
                    // groups array
                    
                    var existingGroup = me.product.get('productImageGroups').find(function(item) {
                        return item.productImageGroupId === values.groupName;
                    });

                    if (existingGroup) {
                        // Check if entry with this fqn already exists and
                        // replace that entry if so
                        var found = false;

                        for (var i = 0; i < existingGroup.productImageGroupTags.length; ++i) {
                            var tag = existingGroup.productImageGroupTags[i];

                            if (tag.fqn === me.form.getValues().productTypeOption) {
                                existingGroup.productImageGroupTags[i] = {
                                    fqn: me.form.getValues().productTypeOption,
                                    values: values.optionValues
                                }

                                found = true;
                                break;
                            }
                        }

                        // If not found, push new values
                        if (!found) {
                            existingGroup.productImageGroupTags.push({
                                fqn: me.form.getValues().productTypeOption,
                                values: values.optionValues
                            });
                        }
                    } else {
                        // This group does not exist yet, push new group
                        me.product.get('productImageGroups').push({
                            productImageGroupId: values.groupName,
                            productImageGroupTags: [{
                                fqn: me.form.getValues().productTypeOption,
                                values: values.optionValues
                            }]
                        });
                    }

                    // Assign a group code to new images
                    // then merge new images with this.product.data.productImages
                    Ext.Array.forEach(editor.record.data.imageGroupImages, function(newImage, idx) {
                        newImage.productImageGroupId = editor.record.data.groupName;
                        if(newImage.name)
                            newImage.imageName = newImage.name 
                        else
                            newImage.name = newImage.imageName;
                        newImage.isMerged = true;
                        newImage.sequence = idx;

                        var existingId = -1;

                        Ext.Array.forEach(product.get('productImages'), function(image, idx) {
                            if (
                                image.productImageGroupId === newImage.productImageGroupId &&
                                image.cmsId === newImage.cmsId
                            ) {
                                existingId = idx;
                            }
                        });

                        if (existingId < 0) {
                            product.get('productImages').splice(idx, 0, newImage);
                        } else {
                            Ext.Object.merge(product.get('productImages')[existingId], newImage);
                        }
                    });

                    // Determine which images to remove
                    var groupImages = product.get('productImages').filter(function(image) {
                        return image.productImageGroupId === editor.record.get('groupName');
                    });

                    var remove = {};
                    Ext.Array.forEach(groupImages, function(image) {
                        var found = editor.record.get('imageGroupImages').find(function(item) {
                            if (item.id) {
                                return item.id === image.id;
                            }
                            return item.cmsId === image.cmsId;
                        });

                        if (!found) {
                            remove[image.id] = true;
                        }
                    });

                    var filteredImages = product.get('productImages').filter(function(image) {
                        return !remove[image.id];
                    });
                    
                    var defaultGroup = me.record.data.productImageGroups.find(function (item, idx) {
                        if (item.productImageGroupId === "default") {
                            me.record.data.productImageGroups.splice(idx, 1);
                            return item;
                        }
                    }) || {
                        productImageGroupId: "default",
                        productImageGroupTags: []
                        };
                    me.record.data.productImageGroups.splice(0, 0, defaultGroup);
                    
                    var orderedImages = [];
                    Ext.Array.forEach(filteredImages, function(image, idx) {
                        orderedImages.splice(image.sequence, 0, image);
                    });      
                                  
                    me.record.set('productImages', orderedImages);

                    // HACK: productImages data is overwritten by Ext, use this to guarantee the correct data is sent
                    product.set('_override', { productImages: orderedImages });

                    me.dirtyCounter += 1;
                    //this.parentForm.globalForm.findField('dirtyControl').setValue(me.dirtyCounter);
                }
            }
        });
    },
});
