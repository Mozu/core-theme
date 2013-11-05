/**
 * @class  Taco.view.account.RoleForm
 * category form
 */
Ext.define('Taco.view.category.Form', {
    extend: 'Taco.core.ux.form.Form',
    editTitle: 'Edit Category',
    createTitle: 'Create New Category',
    requires: [
        'Taco.shared.view.field.Image'
    ],
    ui: 'subform',
    defaults: {
        xtype: 'textfield',
        width: "100%"
    },
    items: [
        {
            name: 'name',
            fieldLabel: 'Category Name',
            allowBlank: false,
            maxLength: 80,
            enforceMaxLength: true,
            required: true,
            minLength: 3
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
            fieldLabel: 'Description' 
        }, {
            //Note: need to update the record manually in the beforeSave class method. form.Form does not extract the value from the imageField automatically.
            fieldLabel: 'Category Image',
            name: 'categoryImages',
            xtype: 'taco.imagefield',
            width: '100%'
        }, {
            name: 'slug',
            fieldLabel: 'SEO Friendly URL',
            xtype: 'slugfield',
            slugPrefix: 'www.mystore.com/category/'
        },  {
            name: 'pageTitle',
            fieldLabel: 'Page Title'
        }, {
            name: 'metaTitle',
            fieldLabel: 'Meta Title'
        }, {
            name: 'metaDescription',
            fieldLabel: 'Meta Description'
        }, {
            name: 'metaKeywords',
            fieldLabel: 'Keywords'
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