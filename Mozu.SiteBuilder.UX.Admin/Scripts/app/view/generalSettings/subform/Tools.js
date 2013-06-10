/**
 * @class Taco.view.generalSettings.subform.Tools
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Tools', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Tools',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [{
            // TODO: Need instructions
            xtype: "container",
            items: [{
                xtype: "component",
                html: "<h2 style='padding: 10px 0'>Upload your file for Google Webmaster Tools</h2>" +
                    "<p>If you're trying to connect your site to Google Webmaster Tools, you've come to the right place.  Upload a copy of the page you want to connect in the space provided below.</p>"
            }, {
                xtype: 'button',
                text: 'Upload file',
                margin: "12 0 0 0",
                handler: function () {
                    var form = me.googleWebmasterTools.getForm();
                    if (form.isValid()) {
                        //console.log("Attempting to upload your file", form.getFields());
                        //window.top.fff = form.getFields();
                        form.submit({
                            url: "/admin/app/webtools/webmasterTools",
                            headers: [
                                { "Accept": "application/json" }
                            ],
                            waitMsg: "Uploading your file...",
                            success: function (form, action) {
                                console.log("form/action", form, action);
                            },
                            failure: function () {
                                console.error(arguments);
                            }
                        })
                    }
                }
            }]
        }, {
            xtype: "filefield",
            name: "gwtFile",
            fieldLabel: "Upload your file for Google Webmaster Tools",
            labelAlign: "top",
            allowBlank: false,
            buttonText: "Select file...",
            margin: "0 0 0 75"
        }];

        this.callParent(arguments);
    }
});