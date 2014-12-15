/**
 * @class  Taco.view.account.RoleForm
 * category form
 */
Ext.define('Taco.view.category.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.shared.view.field.Image',
        'Taco.core.ux.CategoryComboBox',
        'Taco.core.ux.form.SlugField'
    ],

    ui: 'subform',
    editTitle: 'Edit Category',
    createTitle: 'Create New Category',

    header: false,

    bodyStyle: {
        'border-top-width': '0px'
    },

    defaults: {
        xtype: 'textfield',
        width: "100%"
    },

    items: [
    
        {
            name: 'categoryCode',
            fieldLabel: 'Category Code',
            allowBlank: true,
            maxLength: 30,
            required: false,
            regex: /^[a-z0-9_\-]+$/i,
            regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
        }, {
            name: 'name',
            fieldLabel: 'Category Name',
            allowBlank: false,
            maxLength: 200,
            enforceMaxLength: true,
            required: true,
            minLength: 3,
            listeners: {
                change: function (cmp, newValue) {
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
            
        },
        // note: i had to nest the combo box in a fieldcontainer and do layout fit to get the combo to be 100% width. not sure why.
        {
            xtype: 'fieldcontainer',
            layout: "fit",
            items:[
                {
                    xtype: 'categorycombobox',
                    name: 'parentId',
                    fieldLabel: 'Assign to Other Category',
                    validator: function (value) {
                        if (value == this.up().up().child('component[name="name"]').value) {
                            return 'Category name is in use';
                        } else {
                            return true;
                        }
                    }
                }
            ]
        }, {
            xtype: 'textarea',
            rows: '10',
            name: 'description',
            fieldLabel: 'Description',
            maxLength: 500
        }, {
            //Note: need to update the record manually in the beforeSave class method. form.Form does not extract the value from the imageField automatically.
            fieldLabel: 'Category Image',
            name: 'categoryImages',
            xtype: 'taco.imagefield',
            width: '100%'
        }, {
            name: 'slug',
            fieldLabel: 'SEO Friendly URL',
            xtype: 'slugfield'
            
        },  {
            name: 'pageTitle',
            fieldLabel: 'Page Title',
            maxLength: 100
        }, {
            name: 'metaTitle',
            fieldLabel: 'Meta Title',
            maxLength: 100
        }, {
            name: 'metaDescription',
            fieldLabel: 'Meta Description',
            maxLength: 500
        }, {
            name: 'metaKeywords',
            fieldLabel: 'Keywords',
            maxLength: 500
        }, {
            name: 'isHidden',
            xtype: 'checkboxfield',
            boxLabel: 'Hide Category'
        }
    ],
    
    initComponent: function () {
        this.title = this.record.data.name;
        this.callParent(arguments);

       
    },
    
    // called by Taco.core.ux.form.Form automatically when the form panel is initializing; can be used to transform the data in the record and populate the fields manually;
    loadForm: function () {
        this.callParent(arguments);
    },
    
    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    beforeSave: function () {
        var me = this,
            form = me.getForm(),
            categoryImagesField = form.findField("categoryImages");
        
        // need to update the record manually. form.Form does not extract the value from the imageField automatically.
        me.record.set("categroryImages", categoryImagesField.getValue());
        return true;
    }
});