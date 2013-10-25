/**
 * @class Taco.view.generalSettings.subform.Tools
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Tools', {
    //extend: 'Taco.view.product.subform.Subform',
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Tools',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [
            {
                xtype: "fieldcontainer",
                fieldLabel: "Upload your file for Google Webmaster Tools",
                items: [
                    {
                        xtype:"component",
                        margin: "0 0 10 0",
                        style:"font-size:1.4rem",
                        html: "If you're trying to connect your site to Google Webmaster Tools, you've come to the right place.  <br/>Upload a copy of the page you want to connect."
                            
                    },
                    {
                        xtype: "filefield",
                        buttonOnly: true,
                        buttonConfig: {
                            ui: 'action',
                            text: 'Upload file',
                            scale: 'medium'
                        },
                        width: 300,
                        name: "gwtFile",
                        validate: function() { return true; },
                        labelAlign: "top",
                        allowBlank: false,
                        listeners: {
                            change: {
                                fn: function() {
                                    this.onFileUpload();
                                },
                                scope: me
                            }
                        }
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },
    
    onFileUpload: function () {
        var me = this;
        var form = me.getForm();
        if (form.isValid()) {
            form.submit(
                {
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
                }
            );
        }
    }
});