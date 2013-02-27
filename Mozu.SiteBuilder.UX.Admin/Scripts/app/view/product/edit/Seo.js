///**
// * @author Travis Johnson
// * @class Taco.view.product.edit.Seo
// */


//    Ext.define('Taco.view.product.edit.Seo', {
//        extend: 'Taco.core.ux.form.Module',
//        disabled: true,
//        model: 'Taco.model.Product',

//        disabledTitle: 'manage SEO',
//        disabledMessage: 'Increase your chances of being found on search results by using relevant keywords and description.',

//        form: {
//            defaults: {
//                xtype: 'textfield',
//                labelAlign: 'top',
//                labelSeparator: '',
//                width: 550
//            },
//            items: [{
//                name: 'seoFriendlyUrl',
//                fieldLabel: 'SEO Friendly URL',
//                xtype: 'slugfield',
//                slugPrefix: 'www.mystore.com/category/'
//            }, {
//                name: 'pageTitle',
//                fieldLabel: 'Page Title'
//            }, {
//                name: 'metaTagTitle',
//                fieldLabel: 'Meta Title'
//            }, {
//                name: 'metaTagDescription',
//                fieldLabel: 'Meta Description'
//            }, {
//                name: 'metaTagKeywords',
//                fieldLabel: 'Keywords'
//            }]
//        },

//        initComponent: function () {
//            var me = this;

//            me.callParent(arguments);
//        }
//    });
