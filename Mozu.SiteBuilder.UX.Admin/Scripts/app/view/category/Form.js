/**
 * @class  Taco.view.account.RoleForm
 * category form
 */
Ext.define('Taco.view.category.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.shared.view.field.Image',
        'Taco.core.ux.CategoryComboBox',
        'Taco.core.ux.form.SlugField',
        'Taco.view.filter.ExpressionTreePanel',
        'Taco.view.filter.Schema',
        'Taco.view.filter.OperatorField'
    ],

    ui: 'subform',
    editTitle: 'Edit Category',
    createTitle: 'Create New Category',

    header: false,

    bodyStyle: {
        'border-top-width': '0px'
    },
    
    initComponent: function () {
        var me = this,
            categoryType = this.record.get("categoryType");

        

        this.title = this.record.data.name;

        if (categoryType != "Static") {

            var expressionData = this.record.get("dynamicExpression");

            //expression needs the type so that it can be validated appropriatly.
            expressionData.type = this.record.get("categoryType");

            this.expressionTreePanel = Ext.create('Taco.view.filter.ExpressionTreePanel', {
                name: "dynamicExpression",
                type:expressionData.type,
                data: expressionData,
                editable: true,
                showEditButton: false,
                showCodeButton: true
            });
        }

        this.items = [];
        var leftItems = [];
        var rightItems = [];

        leftItems.push(
        {
            name: 'name',
            fieldLabel: 'Category Name',
            allowBlank: false,
            xtype: 'textfield',
            width: "100%",
            maxLength: 200,
            enforceMaxLength: true,
            required: true,
            minLength: 3,
            listeners: {
                change: function(cmp, newValue) {
                    cmp.slugField = cmp.slugField || cmp.up('formform').down('[name="slug"]');
                    var previous = cmp.slugField.onNameChangeValue,
                        current = cmp.slugField.getValue(),
                        newValue;
                    if (current && previous != current) {
                        return;
                    }
                    cmp.slugField.setValue(newValue);
                    cmp.slugField.onNameChangeValue = cmp.slugField.getValue();

                }
            }
        }, {
            name: 'categoryCode',
            fieldLabel: 'Category Code',
            itemId: "categoryCodeField",
            xtype: 'textfield',
            width: "100%",
            allowBlank: true,
            maxLength: 30,
            required: false,
            emptyText: 'If left blank, a code will be generated',
            regex: /^[a-z0-9_\-]+$/i,
            regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
        }, {
            xtype: 'categorycombobox',
            name: 'parentId',
            fieldLabel: 'Parent Categroy',
            width: "100%",
            showDynamicRealTime: false,
            showDynamicPreComputed: false,
            excludedIds: [this.record.get("categoryCode")]
        }, {
            xtype: 'fieldcontainer',
            layout: "fit",
            width: "100%",
            fieldLabel: "Options",
            items: [
                {
                    name: 'isHidden',
                    width: "100%",
                    xtype: 'checkboxfield',
                    boxLabel: 'Hide category on store front'
                }
            ]
        });
        
        

        rightItems.push({
            xtype: 'textarea',
            height: 148,
            margin: {
                bottom:0
            },
            name: 'description',
            width: "100%",
            fieldLabel: 'Description',
            maxLength: 500
        });
        

        this.dynamicCategoryTypeCombo = Ext.create('Ext.form.field.ComboBox',
            Taco.core.ux.TooltipLabel.wrapConfig('category.productMembership', me, {
            xtype: 'combobox',
            name: 'dynamicCategoryTypeCombo',
            fieldLabel: 'Product Membership',
            width: 300,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            initialValue: "Active",
            disabled: !this.record.phantom,
            // temporarily disabling the ability to create real time dynamic expressions. service isn't ready yet.
            //disabled: true,
            value:(this.record.get("categoryType")=="DynamicPreComputed") ? "yes" : "no",
            listeners: {
                scope: me,
                'change': function(field, newValue, oldValue, e) {
                    var type = "DynamicPreComputed";
                    if (newValue == "no") {
                        type = "DynamicRealTime";
                    }

                    this.record.set("categoryType", type);
                    this.expressionTreePanel.setType(type);
                }
                // need to validate any expressions we have currently since the rules change for each type.



            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Realtime",
                        id: "no"
                    },{
                        name: "Precomputed",
                        id: "yes"
                    }
                ]
            })
        }));

        

        if (categoryType !== "Static") {
            rightItems.push(this.dynamicCategoryTypeCombo);
        }



        this.items.push({
            xtype: 'fieldcontainer',
            layout: "hbox",
            //width: "100%",
            //fieldLabel: "Options",
            items: [
                {
                    xtype: 'fieldcontainer',
                    flex: 1,
                    layout: "vbox",
                    margin: {
                        right: 10
                    },
                    items: leftItems
                },{
                    xtype: 'fieldcontainer',
                    margin: {
                      left:10  
                    },
                    flex: 1,
                    items: rightItems
                }
            ]
        });


        if (categoryType !== "Static") {
            this.items.push(this.expressionTreePanel);
        }

        

        this.items.push({
                //Note: need to update the record manually in the beforeSave class method. form.Form does not extract the value from the imageField automatically.
                fieldLabel: 'Category Image',
                name: 'categoryImages',
                xtype: 'taco.imagefield',
                width: "100%"
            }, {
                name: 'slug',
                fieldLabel: 'SEO Friendly URL',
                width: "100%",
                xtype: 'slugfield'

            }, {
                name: 'pageTitle',
                fieldLabel: 'Page Title',
                xtype: 'textfield',
                width: "100%",
                maxLength: 100
            }, {
                name: 'metaTitle',
                fieldLabel: 'Meta Title',
                xtype: 'textfield',
                width: "100%",
                maxLength: 100
            }, {
                name: 'metaDescription',
                fieldLabel: 'Meta Description',
                xtype: 'textfield',
                width: "100%",
                maxLength: 500
            }, {
                name: 'metaKeywords',
                xtype: 'textfield',
                width: "100%",
                fieldLabel: 'Keywords',
                maxLength: 500
            }
        );

        this.callParent(arguments);

        me.mon(me, 'boxready', function () {
            var focusField = me.down("#categoryCodeField");
            focusField.focus();
        }, {
            delay:1
        });

    },
    
    // called by Taco.core.ux.form.Form automatically when the form panel is initializing; can be used to transform the data in the record and populate the fields manually;
    loadForm: function () {
        this.callParent(arguments);
        
    },
    
    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    beforeSave: function () {
        var uploadedImages = [],
            form = this.getForm(),
            categoryImagesField = form.findField("categoryImages");
        
        if (categoryImagesField) {
            uploadedImages = Ext.Array.filter(categoryImagesField.getValue(), function(img) {
                return img.isUploaded;
            });
        } 

        // need to update the record manually. form.Form does not extract the value from the imageField automatically.
        this.record.set("categoryImages", uploadedImages);

        if (this.expressionTreePanel) {
            var treeData = this.expressionTreePanel.getValue();
            var expressionData = {
                tree: treeData,
                type: this.record.get("categoryType")
            }

            this.record.set("dynamicExpression", expressionData);
        }

        
        //var categoryStore = Taco.core.data.StoreManager.getOrCreate("Taco.store.Categories");
        //if (categoryStore) {
        //    categoryStore.needsRefresh = true;
        //}
        

        return true;
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});