/**
 * @class Taco.view.product.subform.Images
 */

Ext.define('Taco.view.product.subform.Images', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productimagessubform',
    title: 'Images',
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

        var productTypeOptionsStore = this.product.data.options
        ? this.product.data.options.map(function(item) {
            var found = me.record.productTypeRecord.data.options.find(function(option) {
                return option.attributeFQN === item.attributeFQN;
            });

            return [item.attributeFQN, found.adminName];
        })
        : [];

        var attributeValuesMap = {};

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

        var activeOption = this.record.get('options').find(function(attribute) {
            return attribute.isProductImageGroupSelector;
        });

        this.addImageGroupButton = Ext.widget({
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            text: 'Create Image Group',
            itemId: 'addImageGroupButton',
            scope: me,
            hidden: activeOption === undefined,
            margin: '0 0 15 10',
            padding: '10 25',
            style: { "float": 'right' },
            handler: function() {
                me.createPopup(null, true);
            },
            hidden: true
        });

        this.imageGroupGrid = Ext.create('Taco.view.product.images.imageGroupGrid.Grid', {
            id:'image-group-grid',
            hideSubnavLinks: true,
            margin: '30 0 20 0',
            useWhiteContainer: true,
            viewConfig: {
                deferEmptyText: true,
                emptyText: me.record.phantom ? 'Save the category to add image groups' : 'None Available'
            },
            hideNavMenu: true,
            isCatalogLevel: true,
            isPopUp: true,
            pageSize: 50,
            minHeight: 150,
            hidden: activeOption === undefined,
            onItemClick: this.onImageGroupItemClick.bind(me),
            onItemDelete: this.onImageGroupDelete.bind(me),
            hidden: true
        });

        this.imagesField = Ext.widget({
            fieldLabel: 'Product Images',
            xtype: 'taco.imagefield',
            width: '100%',
            margin: '20 0 0 15',
            imageMetadata: this.record.get('productImages'),
            onValueChanged: function(value) {
                var defaultImages = me.record.get('productImages').filter(function(image) {
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

                var filteredImages = me.record.get('productImages').filter(function(image) {
                    return !remove[image.cmsId];
                }).concat(add);
                
                var orderedImages = [];
                Ext.Array.forEach(filteredImages, function(image, idx) {
                    orderedImages.splice(image.sequence, 0, image);
                });

                me.record.set('productImages', orderedImages);
                me.record.set('_override', filteredImages);
            }
        });

        this.useImageGroupsCheckbox = Ext.create('Ext.form.field.Checkbox', {
            margin: '0 25 0 20',
            boxLabel: 'Assign images to Options',
            handler: function() {
                me.productTypeOptions.setVisible(this.checked);
                me.imagesField.setVisible(!this.checked);

                if (!this.checked) {
                    // loop through image groups and set each group is isProductImageGroupSelector = false
                    Ext.Array.forEach(me.record.get('options'), function(attribute) {
                        attribute.isProductImageGroupSelector = false;
                    });

                    // update images if changes were made in ImageGroupSelector
                    var defaultImages = me.record.data.productImages.filter(function(image) {
                        return image.productImageGroupId === 'default'
                    });
                    me.imagesField.setValue(defaultImages);

                    me.productTypeOptions.setValue(null);
                }
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
            fieldLabel: 'Selected option',
            width: '50%',
            allowBlank: true,
            margin: '0 0 0 15',
            queryMode: 'local',
            store: productTypeOptionsStore,
            value: null,
            name:'productTypeOption',
            hidden: activeOption === undefined,
            listeners: {
                change: function(cmp, value) {
                    Ext.Array.forEach(me.record.get('options'), function(attribute) {
                        attribute.isProductImageGroupSelector = attribute.attributeFQN === value;
                    });

                    me.imageGroupGrid.setVisible(value !== null);
                    me.addImageGroupButton.setVisible(value !== null);
                    var gridEntries = me.getGridEntries(value);
                    me.imageGroupGrid.store.loadData(gridEntries);
                }
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'product-type-option',
                hoverTarget: 'label',
                messageKey: 'product.images.productTypeOption',
                offsetLeft: 20,
                offsetTop: 15
            })
        });

        this.productTypeOptionsContainer = Ext.widget({
            xtype: 'container',
            width: '100%',
            layout: 'hbox',
            margin: '0 0 25 0',
            items: [
                this.useImageGroupsCheckbox,
                this.productTypeOptions
            ]
        });

        var defaultImages = me.record.data.productImages.filter(function(image) {
            return image.productImageGroupId === 'default'
        });

        me.imagesField.setValue(defaultImages);

        this.items = [
            this.productTypeOptionsContainer,
            this.addImageGroupButton,
            this.imageGroupGrid,
            this.imagesField
        ];

        if (activeOption) {
            // Check the checkbox
            this.useImageGroupsCheckbox.setValue(true);

            // Set dropdown value
            this.productTypeOptions.setValue(activeOption.attributeFQN);
        }

        this.callParent(arguments);
        this.updateFieldVisibility();

        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
        });
    },

    getGridEntries: function(fqn) {
        var entries = [];

        if (!this.record.data.productImageGroups) {
            return entries;
        }

        this.record.data.productImageGroups.forEach(function(group) {
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
        this.record.data.productImageGroups = this.record.data.productImageGroups.filter(function(group) {
            return group.productImageGroupId !== record.data.groupName;
        });

        var removeIdx = this.imageGroupGrid.store.find('groupName', record.data.groupName);
        this.imageGroupGrid.store.removeAt(removeIdx);

        this.dirtyCounter += 1;
        this.productForm.findField('dirtyControl').setValue(this.dirtyCounter);

        // delete all associated images from the product record
        this.record.set('productImages', this.record.data.productImages.filter(function(image) {
            return image.productImageGroupId !== record.data.groupName;
        }));
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
            this.productTypeOptionsContainer.setVisible(
                this.product.data.productUsage == 'Configurable'
            );
        }
    },

    createPopup: function(record, isNew) {
        var me = this;

        Ext.create('Taco.view.product.images.ImageGroupEditor', {
            attributes: this.record.productTypeAttributes[
                this.productTypeOptions.value
            ],
            record: record,
            product: me.record,
            parentForm: this,
            isCreateMode: isNew,
            listeners: {
                savesuccess: function(editor) {
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
                    
                    var existingGroup = me.record.data.productImageGroups.find(function(item) {
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
                        me.record.data.productImageGroups.push({
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
                        newImage.name ? newImage.imageName = newImage.name : newImage.name = newImage.imageName;
                        newImage.isMerged = true;
                        newImage.sequence = idx;

                        var existingId = -1;

                        Ext.Array.forEach(me.product.data.productImages, function(image, idx) {
                            if (
                                image.productImageGroupId === newImage.productImageGroupId &&
                                image.cmsId === newImage.cmsId
                            ) {
                                existingId = idx;
                            }
                        });

                        if (existingId < 0) {
                            me.product.data.productImages.splice(idx, 0, newImage);
                        } else {
                            Ext.Object.merge(me.product.data.productImages[existingId], newImage);
                        }
                    });

                    // Determine which images to remove
                    var groupImages = me.record.get('productImages').filter(function(image) {
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

                    var filteredImages = me.record.get('productImages').filter(function(image) {
                        return !remove[image.id];
                    });
                    
                    var defaultGroup = me.record.data.productImageGroups.find(function(item, idx) {
                        if (item.productImageGroupId === "default") {
                            me.record.data.productImageGroups.splice(idx, 1);
                            return item;                          
                        }
                    });
                    me.record.data.productImageGroups.splice(0, 0, defaultGroup);
                    
                    var orderedImages = [];
                    Ext.Array.forEach(me.record.data.productImageGroups, function(group) {
                        var orderedGroup = [];
                        Ext.Array.forEach(filteredImages, function(image, idx) {
                            if (image.productImageGroupId === group.productImageGroupId) {
                                orderedGroup.splice(image.sequence, 0, image);
                            }
                        });
                        orderedImages = orderedImages.concat(orderedGroup);
                    });

                    me.record.set('productImages', orderedImages);

                    // HACK: productImages data is overwritten by Ext, use this to guarantee the correct data is sent
                    me.record.set('_override', { productImages: orderedImages });

                    me.dirtyCounter += 1;
                    this.parentForm.globalForm.findField('dirtyControl').setValue(me.dirtyCounter);
                }
            }
        });
    },
});
