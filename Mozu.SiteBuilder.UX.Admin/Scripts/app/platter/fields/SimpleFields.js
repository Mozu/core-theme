/**
* The Discount list (grid) view
*/
Ext.define('Taco.platter.fields.SimpleFields', {
    singleton: true,
    requires: [
        'Ext.form.field.Text',
        'Taco.core.ux.form.field.BaseImageField',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Taco.shared.view.field.Product',
        'Taco.shared.view.field.Category'
    ],
    constructor: function () {

    }
});

Ext.define('Taco.platter.fields.DateTime', {
    extend: 'Taco.core.ux.picker.DateTime',
    format:'c',
    alias: ['widget.mz-input-date']
});

Ext.define('Taco.platter.fields.Text', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.mz-input-text']
});


Ext.define('Taco.platter.fields.Code', {
    extend: 'Taco.core.ux.form.field.Code',
    alias: ['widget.mz-input-code'],
    mode: 'html',
});

Ext.define('Taco.platter.fields.HtmlEditor', {
    extend: 'Ext.form.HtmlEditor',
    alias: ['widget.mz-input-richtext'],
    enableAlignments: false,
    enableColors:false,
    enableFont: false,
    enableFontSize:false,
});

Ext.define('Taco.platter.fields.Texa', {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.mz-input-richtext']
    

});



Ext.define('Taco.platter.fields.DropDown', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.mz-input-dropdown'],
    queryMode: 'local',
    editable: false,
    triggerAction: 'all',
    typeAhead: false

});

Ext.define('Taco.platter.fields.MultiSelect', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: ['widget.mz-input-selectmulti'],
    multiSelect: true,
    margin: 0,
    triggerOnClick: false,
    typeAhead: true,
    style: {
        display: 'inline-table',
        verticalAlign: 'bottom'
    }
})

Ext.define('Taco.platter.fields.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: ['widget.mz-input-checkbox']
    
});

Ext.define('Taco.platter.fields.Number', {
    extend: 'Ext.form.field.Number',
    alias: ['widget.mz-input-number'],
    hideTrigger: true,
    mouseWheelEnabled: false

});


Ext.define('Taco.platter.fields.Image', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-image'],
   
});
Ext.define('Taco.platter.fields.ImageSimple', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-image-nostyle'],
    allowStyles: false,
});
Ext.define('Taco.platter.fields.ImageUrl', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-imageurl'],
    allowStyles: false,
    dataFormat: 'urlOnly',
    allowAltText: false
});

Ext.define('Taco.platter.fields.Product', {
    extend: 'Taco.shared.view.field.Product',
    emptyText: 'Select Product',
    alias: ['widget.mz-input-product'],
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiProduct', {
    extend: 'Taco.shared.view.field.Product',
    emptyText: 'Select Products',
    alias: ['widget.mz-input-productmulti']

});

Ext.define('Taco.platter.fields.Category', {
    extend: 'Taco.shared.view.field.Category',
    alias: ['widget.mz-input-category'],
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiCategory', {
    extend: 'Taco.shared.view.field.Category',
    alias: ['widget.mz-input-categorymulti']
});

Ext.define('Taco.platter.fields.Discount', {
    extend: 'Taco.shared.view.field.Discount',
    alias: ['widget.mz-input-discount'],
    emptyText: 'Select Discount',
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiDiscount', {
    extend: 'Taco.shared.view.field.Discount',
    alias: ['widget.mz-input-discountmulti'],
    emptyText: 'Select Discounts',
    multiSelect: true
});

Ext.define('Taco.platter.fields.NavNode', {
    extend: 'Taco.shared.view.field.NavNode',
    alias: ['widget.mz-input-navnode'],
    emptyText: 'Select Navigation Nodes',
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiNavNode', {
    extend: 'Taco.shared.view.field.NavNode',
    alias: ['widget.mz-input-navnodemulti'],
    emptyText: 'Select Navigation Nodes',
    multiSelect: true
});