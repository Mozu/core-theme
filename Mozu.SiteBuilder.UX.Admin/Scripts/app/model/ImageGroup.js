Ext.define('Taco.model.ImageGroup', {
	extend: 'Taco.core.data.Model',
	fields: [
		{ name: 'groupName', type: 'string' },
		{ name: 'optionValues', type: 'array' },
        { name: 'isImageGroupSelector', type: 'boolean' }
	],
	proxy: {
        type: 'memory',
        reader: {
            type: 'json',
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },
    getDeletePromptMessage: function() {
        var msg = 'Are you sure you want to delete image group"' + this.get('groupName') + '"?';
        return msg;
    }
});
