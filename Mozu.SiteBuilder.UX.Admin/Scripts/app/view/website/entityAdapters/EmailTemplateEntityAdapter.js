/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.EmailTemplateEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
 
    

    allowedActions: {
        copy: true,
        preview: true,
        destroy: true,
        publishPage: true
    }

  

});
