/**
 * @class Taco.view.generalSettings.subform.Robots
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Robots', {
    requires: ['Taco.core.ux.form.FileInputButton'],
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    title: 'Robots',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [
            {
                xtype: "fieldcontainer",
                fieldLabel: "Upload your robots.txt file",
                items: [

                    {
                        xtype: "tacofilefield",
                        buttonOnly: true,
                        buttonConfig: {
                            ui: 'action',
                            text: 'Upload file',
                            scale: 'medium'
                        },
                        width: 300,
                        name: "gwtFile",
                        validate: function () {
                            return true;
                        },
                        isValid: function () {
                            return true;
                        },
                        labelAlign: "top",
                        allowBlank: false,
                        listeners: {

                            filechange: {
                                fn: me.onFileUpload,

                                scope: me
                            }
                        }
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },
    onFileUpload: function (fileList, e, callback) {
        var me = this,
            files = [];
        me.setLoading(true);
        Ext.each(fileList, function (file) {
            files.push(file);
        });

        Ext.each(files, function (file) {
            var reader;

            reader = new FileReader();


            reader.onload = function (e) {


                Ext.Ajax.request({
                    url: "/admin/app/webtools/robotsTxt",
                    method: 'post',
                    jsonData: {
                        content: e.target.result
                    },
                    success: function () {
                        me.setLoading(false);
                    },
                    failure: function (resp) {
                        me.setLoading(false);
                        var json = Ext.decode(resp.responseText, true),
                            msg = (json && json.message) ? json.message : "Error uploading file";

                        Taco.app.fireEvent('setmessage', msg, 'error');
                    }
                });


            };
            reader.readAsText(file);
        });

    }
});