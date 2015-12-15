/**
 * @class Taco.model.SubnavLink
 */

Ext.define('Taco.model.SubnavLink', {
	extend: 'Taco.core.data.Model',
	fields: [
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
        }
	]
});
