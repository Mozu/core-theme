/**
* The Discount list (grid) view
*/
Ext.define('Taco.platter.forms.SimpleForms', {
    singleton: true,
    requires: [
       'Taco.core.ux.form.entities.TemplateEditorForm',
       'Taco.core.ux.form.entities.WebPageEditorForm',
       'Taco.core.ux.form.entities.ProductEditorForm',
       'Taco.core.ux.form.entities.EntityEditorForm',
       'Taco.core.ux.form.entities.CategoryEditorForm'
    ],
    constructor: function () {

    }
});

Ext.define('Taco.platter.forms.TemplateEditorForm', {
    extend: 'Taco.core.ux.form.entities.TemplateEditorForm',
    alias: ['widget.mz-form-templatecontent']
});

Ext.define('Taco.platter.forms.WebPageEditorForm', {
    extend: 'Taco.core.ux.form.entities.WebPageEditorForm',
    alias: ['widget.mz-form-webpage']
});

Ext.define('Taco.platter.forms.ProductEditorForm', {
    extend: 'Taco.core.ux.form.entities.ProductEditorForm',
    alias: ['widget.mz-form-product']
});

Ext.define('Taco.platter.forms.EntityEditorForm', {
    extend: 'Taco.core.ux.form.entities.EntityEditorForm',
    alias: ['widget.mz-form-entity']
});

Ext.define('Taco.platter.forms.CategoryEditorForm', {
    extend: 'Taco.core.ux.form.entities.CategoryEditorForm',
    alias: ['widget.mz-form-category']
});

Ext.define('Taco.platter.forms.WidgetForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.mz-form-widget'
});


