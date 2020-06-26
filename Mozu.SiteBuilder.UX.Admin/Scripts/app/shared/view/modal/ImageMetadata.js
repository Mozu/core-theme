/**
 * @class Taco.shared.view.modal.ImageMetadata
 */
Ext.define('Taco.shared.view.modal.ImageMetadata', {
    extend: 'Taco.core.ux.window.Modal',

    closeAction: 'destroy',
    autoShow: true,
    scale: 'medium',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.image_alternative_text,
    primaryText: Localizer.langResources.SHARED.ok,

    initComponent: function () {
        var me = this;

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'anchor'
            },
            items: [{
                xtype: 'textarea',
                name: 'alt',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.alt_text_for_image,
                allowBlank: true,
                selectOnFocus: true,            
                width: "100%",
                validateOnChange: true,
                validator: function (val) {
                    var maxLen = 150,
                        encodedLength = (!val) ? 0 : Ext.util.Format.htmlEncode(val).length;
                    if (encodedLength <= maxLen)
                        return true;
                    return Localizer.langResources.CATALOG.Products.ProductEdit.maximum_characters_is + ' ' + maxLen + ', ' + Localizer.langResources.CATALOG.Products.ProductEdit.including_characters_escaped_html + ' "&". ' + Localizer.langResources.CATALOG.Products.ProductEdit.reduce_text + ' ' + (encodedLength - 150) + ' ' + Localizer.langResources.CATALOG.Products.ProductEdit.character + '' + ((encodedLength - 150 > 1) ? 's.' : '.');
                }
            }]
        });

        this.items = [this.form];

        this.form.getForm().setValues(me.record.getData());

        this.callParent(arguments);

        this.on({
            show: {
                scope: this,
                fn: function () {
                    var field = this.form.findField('alt');
                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    doSave: function () {
        var me = this,
            data = me.form.getValues();

        me.record.set(data);
        me.saveSuccess(me.record);
    }

});

