/**
 * @class Taco.model.SubnavLink
 */

Ext.define('Taco.model.SubnavLink', {
	extend: 'Taco.core.data.Model',
    idProperty:'_id',
    fields: [
        {
            name: '_id',
            type: 'string'
        },
        {
            name:'requiredContext',
            type: 'string'
        },
		{
            name: 'location',
            type: 'string'
        },
        {
            name: 'displayMode',
            type: 'string'
        },
        {
            name: 'modalWindowTitle',
            type: 'string'
        },
        {
            name: 'href',
            type: 'string'
        },
        {
            name: 'appId',
            type: 'string'
        },
        {
            name: 'badgeInitials',
            type: 'string'
        },
        {
            name: 'badgeImage',
            type: 'string'
        },
        {
            name: 'path',
            type: 'auto'
        },
        {
            name: 'parentId',
            type: 'string'
        },
        {
            name: 'windowTitle',
            type: 'string'
        },
        {
            name: 'guid',
            type: 'string'
        }
	]
});
