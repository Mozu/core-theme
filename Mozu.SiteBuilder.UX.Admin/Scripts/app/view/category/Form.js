/* globals Promise */
/**
 * @class  Taco.view.category.Form
 * category form
 * @extends Taco,core.ux.form.form
 */
Ext.define("Taco.view.category.Form", {
    extend: "Taco.core.ux.form.Form",
    requires: [
        "Taco.shared.view.field.Image",
        "Taco.core.ux.CategoryComboBox",
        "Taco.core.ux.form.SlugField",
        "Taco.view.filter.ExpressionTreePanel",
        "Taco.view.filter.Schema",
        "Taco.view.filter.OperatorField",
        "Taco.view.productRanking.Grid",
        "Taco.view.sortDefinition.Grid",
        "Taco.shared.view.field.CategoryPickerField"
    ],

    itemId: 'taco-category-form',
    ui: 'subform',
    editTitle: 'Edit Category',
    createTitle: 'Create New Category',
    header: false,
    bodyStyle: {
        'border-top-width': '0px'
    },

    initComponent: function () {
        var me = this,
            categoryType = this.record.get("categoryType"),
            parentDefaultFilters = [{
                property: 'status',
                value: 'all'
            }, {
                property: 'type',
                value: 'static'
            }
            ];

        this.title = this.record.data.name;

        if (categoryType != "Static") {
            var expressionData = this.record.get("dynamicExpression");
            //expression needs the type so that it can be validated appropriatly.
            expressionData.type = this.record.get("categoryType");
            this.expressionTreePanel = Ext.create("Taco.view.filter.ExpressionTreePanel", {
                name: "dynamicExpression",
                type: expressionData.type,
                data: expressionData,
                editable: true,
                showEditButton: false,
                showCodeButton: true
            });
        }

        this.items = [];

        this.dynamicCategoryTypeCombo = Ext.create("Ext.form.field.ComboBox", {
            xtype: "combobox",
            name: "dynamicCategoryTypeCombo",
            itemId: "dynamic-cat-type-combo",
            fieldLabel: "Product Membership",
            margin: { left: 20 },
            flex: 2,
            valueField: "id",
            displayField: "name",
            queryMode: "local",
            valueNotFoundText: "not found",
            editable: false,
            forceSelection: true,
            initialValue: "Active",
            disabled: !this.record.phantom,
            // temporarily disabling the ability to create real time dynamic expressions. service isn't ready yet.
            //disabled: true,
            value: (this.record.get("categoryType") == "DynamicPreComputed") ? "yes" : "no",
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: "dynamic-cat-type-combo",
                hoverTarget: 'label',
                messageKey: 'category.productMembership',
                offsetLeft: 25,
                offsetTop: 80
            }),
            listeners: {
                scope: me,
                'change': function (field, newValue) {
                    var type = "DynamicPreComputed";
                    if (newValue === "no") {
                        type = "DynamicRealTime";
                    }
                    this.record.set("categoryType", type);
                    this.expressionTreePanel.setType(type);

                    //tricker the active field change function to make sure the right options display or don't
                    var isActiveField = me.getForm().findField('isActive');

                    isActiveField.fireEvent('change', isActiveField, isActiveField.getValue());

                }
                // need to validate any expressions we have currently since the rules change for each type.
            },
            store: Ext.create("Ext.data.Store", {
                fields: ["id", "name"],
                data: [
                    {
                        name: "Realtime",
                        id: "no"
                    }, {
                        name: "Precomputed",
                        id: "yes"
                    }
                ]
            })
        }
        );

        me.isActive = Ext.create('Ext.form.field.ComboBox', {
            xtype: 'combobox',
            name: 'isActive',
            fieldLabel: 'Status',
            flex: 1,
            editable: false,
            allowBlank: false,
            disabled: (!me.record.phantom
                && me.record.get('parentIsActive') !== null
                && !me.record.get('parentIsActive')),
            store: [[
                true,
                'Active'
            ], [
                false,
                'Disabled'
            ]],
            listeners: {
                scope: me,
                change: function (cmp, newValue) {

                    if (newValue == null) {
                        newValue = true;
                    }

                    me.hiddenOnStorefront.setVisible(newValue);


                }
            }
        });

        if (!me.record.phantom && me.record.get('id')) {
            parentDefaultFilters.push({
                property: 'not-id',
                value: me.record.get('id')
            });
        }

        me.parentCategoryPicker = Ext.create('Taco.shared.view.field.CategoryPickerField', {
            name: "parentCatId",
            fieldLabel: "Parent Category",
            hideLabel: false,
            flex: 1,
            minChars: 2,
            emptyText: 'Search for categories',
            valueField: 'id',
            displayField: 'nameAndCodeAndStatus',
            defaultFilters: parentDefaultFilters,
            isDirty: function () {
                if (this.initialValue === null && this.value === '') {
                    return false;
                }

                return this.initialValue !== this.value;
            },
            listeners: {
                afterrender: function (cmp) {
                    if (!me.record || me.record.phantom || me.record.get('parentId') === -1) {
                        cmp.initialValue = null;
                        return;
                    }
                    var parentCat = Ext.create('Taco.model.Category', {
                        id: me.record.get('parentId'),
                        categoryCode: me.record.get('parentCode'),
                        name: me.record.get('parentName'),
                        isActive: me.record.get('parentIsActive')
                    });

                    cmp.initialValue = me.record.get('parentId');
                    cmp.setValue(parentCat);
                },
                select: function (cmp, records) {
                    if (!records || records.length === 0) {
                        return;
                    }
                    if (!records[0].get('isActive')) {
                        me.isActive.setValue(false).disable();
                    } else if (me.isActive.isDisabled()) {
                        me.isActive.enable();
                    }
                },
                blur: function (cmp) {
                    if (!cmp.getValue() && me.isActive.isDisabled()) {
                        me.isActive.enable();
                    }
                },
                scope: this
            }
        });

        var secondRowItems = [
            me.isActive,
            me.parentCategoryPicker
        ];

        if (categoryType !== "Static") {
            secondRowItems.push(this.dynamicCategoryTypeCombo);
        } else {
            secondRowItems.push({
                xtype: 'container',
                flex: 2
            })
        }

        this.hiddenOnStorefront = Ext.create('Ext.form.field.Checkbox', {
            name: "isHidden",
            width: "100%",
            xtype: "checkboxfield",
            boxLabel: "Hide category on storefront"
        });



        this.hideSlicingOnCategory = Ext.create('Ext.form.field.Checkbox', {
            name: "hideSlicing",
            value: !me.record.get("shouldSlice"),
            width: "100%",
            xtype: "checkboxfield",
            boxLabel: "Hide slicing on category",


        });

        this.optionsContainer = Ext.create('Ext.form.FieldContainer', {
            xtype: "fieldcontainer",
            layout: "fit",
            width: "100%",
            fieldLabel: "Options",
            items: [
                me.hiddenOnStorefront,
                me.hideSlicingOnCategory
            ]
        });

        this.items.push({
            xtype: "fieldcontainer",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            items: [
                {
                    xtype: "fieldcontainer",
                    flex: 1,
                    layout: "vbox",
                    items: [
                        {
                            name: "name",
                            fieldLabel: "Category Name",
                            allowBlank: false,
                            itemId: "categoryNameField",
                            xtype: "textfield",
                            width: "100%",
                            maxLength: 200,
                            enforceMaxLength: true,
                            required: true,
                            minLength: 3,
                            listeners: {
                                change: function (cmp, newValue) {
                                    cmp.slugField = cmp.slugField || cmp.up("formform").down("[name=\"slug\"]");
                                    var previous = cmp.slugField.onNameChangeValue,
                                        current = cmp.slugField.getValue();
                                    if (current && previous != current) {
                                        return;
                                    }
                                    cmp.slugField.setValue(newValue);
                                    cmp.slugField.onNameChangeValue = cmp.slugField.getValue();
                                }
                            }
                        }, {
                            name: "categoryCode",
                            fieldLabel: "Category Code",
                            itemId: "categoryCodeField",
                            xtype: "textfield",
                            width: "100%",
                            allowBlank: true,
                            maxLength: 30,
                            required: false,
                            emptyText: "If left blank, a code will be generated",
                            regex: /^[a-z0-9_\-]+$/i,
                            regexText: "Invalid character. Please choose from alphanumeric, underscore, or hyphen characters."
                        }
                    ]
                }, {
                    xtype: "fieldcontainer",
                    margin: {
                        left: 20
                    },
                    layout: {
                        type: "vbox"
                    },
                    flex: 1,
                    items: [
                        {
                            xtype: "textarea",
                            name: "description",
                            width: "100%",
                            flex: 1,
                            fieldLabel: "Description",
                            maxLength: 500
                        }
                    ]
                }
            ]
        }, {
            xtype: "fieldcontainer",
            layout: "hbox",
            items: secondRowItems
        }, me.optionsContainer);


        if (categoryType !== "Static") {
            this.items.push(this.expressionTreePanel);
        }

        this.items.push({
            //Note: need to update the record manually in the beforeSave class method. form.Form does not extract the value from the imageField automatically.
            fieldLabel: "Category Image",
            name: "categoryImages",
            xtype: "taco.imagefield",
            width: "100%"
        }, {
            name: "slug",
            fieldLabel: "SEO Friendly URL",
            width: "100%",
            xtype: "slugfield"

        }, {
            name: "pageTitle",
            fieldLabel: "Page Title",
            xtype: "textfield",
            width: "100%",
            maxLength: 100
        }, {
            name: "metaTitle",
            fieldLabel: "Meta Title",
            xtype: "textfield",
            width: "100%",
            maxLength: 100
        }, {
            name: "metaDescription",
            fieldLabel: "Meta Description",
            xtype: "textfield",
            width: "100%",
            maxLength: 500
        }, {
            name: "metaKeywords",
            xtype: "textfield",
            width: "100%",
            fieldLabel: "Keywords",
            maxLength: 500
        }
        );

        this.items.push(
            Ext.create('Taco.view.productRanking.Grid', {
                id: 'product-rankings-grid',
                cls: 'product-ranking-rules-category-page',
                title: "Product Ranking Rules",
                hideSubnavLinks: true,
                margin: '50 0 0 0',
                useWhiteContainer: true,
                minHeight: 350,
                isDisabled: me.record.phantom,
                contextConfig: {
                    requiresContextOfType: ['c']
                },
                viewConfig: {
                    deferEmptyText: false,
                    emptyText: me.record.phantom ? "Save the category to add rules." : "None Available"
                },
                hideNavMenu: true,
                isCatalogLevel: true,
                categoryCode: me.record.get('categoryCode'),
                isPopUp: true,
                pageSize: 5,
                willDisableSortDefinitions: true
            })
        );

        this.items.push(
            Ext.create('Taco.view.sortDefinition.Grid', {
                id: 'sort-definitions-grid',
                cls: 'sort-definitions-grid-category-page',
                title: 'Sort Definitions',
                hideSubnavLinks: true,
                margin: '50 0 0 0',
                useWhiteContainer: true,
                minHeight: 350,
                contextConfig: {
                    requiresContextOfType: ['c']
                },
                viewConfig: {
                    deferEmptyText: true,
                    emptyText: me.record.phantom ? 'Save the category to add sort definitions' : 'None Available'
                },
                hideNavMenu: true,
                isCatalogLevel: true,
                categoryCode: me.record.get('categoryCode'),
                categoryId: me.record.get('id'),
                isPopUp: true,
                pageSize: 50,
                willDisableProductRankings: true
            })
        );

        this.callParent(arguments);

        me.mon(me, "boxready", function () {
            var focusField = me.down("#categoryNameField");
            focusField.focus();
        }, {
            delay: 1
        });

    },

    // called by Taco.core.ux.form.Form automatically when the form panel is initializing; can be used to transform the data in the record and populate the fields manually;
    loadForm: function () {
        this.callParent(arguments);
    },

    getCategoryPreviewTotal: function () {
        var record = this.record;

        return new Promise(function (resolve, reject) {

            // dont make the preview call unless this is a DynamicRealTime call
            if (record.get('categoryType') !== 'DynamicPreComputed') {
                return resolve(0);
            }

            var sites = Taco.app.context.getCurrentContext().sites;
            var siteId = sites && sites[0] ? sites[0].id : null;

            Ext.Ajax.request({
                url: '/admin/app/productruntime/preview',
                method: 'POST',
                params: {
                    expression: record.get('dynamicExpression').text,
                    limit: 0,
                    dataViewMode: 'Live',
                    siteId: siteId
                },
                success: function (response) {
                    var amount = JSON.parse(response.responseText);
                    resolve(amount.total);
                },
                failure: function () {
                    reject();
                }
            }, this);
        });
    },

    showWarningModal: function (total, cb) {
        Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            closeAction: 'destroy',
            scale: 'small',
            title: 'This will Impact ' + total + ' Products',
            primaryText: 'Proceed',
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: 'This dynamic precomputed category will contain <b>' + total + '</b> products. This may delay products appearing in this category, and could cause system degradation. To avoid this, ensure your category contains less than 10,000 products.'
                    })
                ]
            }],
            listeners: {
                beforesave: function () {
                    cb(true);
                },
                beforecancel: function () {
                    cb(false);
                }
            }
        });
    },

    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    beforeAsyncSave: function () {
        var me = this;
        return new Promise(function (resolve) {
            me.updateRecord().then(function () {
                me.getCategoryPreviewTotal().then(function (total) {

                    if (total >= 10000) {
                        me.showWarningModal(total, function (doSave) {
                            if (doSave) {
                                resolve(true);
                            }
                            else {
                                resolve(false);
                                me.fireEvent('savecomplete')
                            }
                        });
                    }

                    else {
                        resolve(true);
                    }

                    // Reset initial value so that dirty check works
                    me.parentCategoryPicker.initialValue = me.parentCategoryPicker.value;
                })['catch'](function () {
                    // if the categoryPreviewTotal fails, just continue
                    resolve(true);
                });
            })
        });
    },

    // need to update the record manually. form.Form does not extract the value from the imageField automatically.
    updateRecord: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var uploadedImages = [],
                form = me.getForm(),
                categoryImagesField = form.findField("categoryImages");

            if (categoryImagesField) {
                uploadedImages = Ext.Array.filter(categoryImagesField.getValue(), function (img) {
                    return img.isUploaded;
                });
            }

            // need to update the record manually. form.Form does not extract the value from the imageField automatically.
            me.record.set("categoryImages", uploadedImages);

            me.record.set('parentId', me.parentCategoryPicker.getValue());
            me.record.set('shouldSlice', !me.hideSlicingOnCategory.getValue());

            if (!me.expressionTreePanel) {
                return resolve()
            }

            var treeData = me.expressionTreePanel.getValue();
            var expressionData = {
                tree: treeData,
                type: me.record.get("categoryType")
            };

            me.expressionTreePanel.getExpressionText(expressionData, function (text) {
                expressionData.text = text;
                me.record.set("dynamicExpression", expressionData);
                resolve();
            });
        });
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.
    */
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});