Ext.define('Taco.data.NavigationTreeNodeReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.taco.data.navigationtreenodereader',

    getResponseData: function (response) {
        var data = this.callParent([response]);

        data.records.forEach(function (element) {
            if (element.data.nodeType === 'template' && !element.data.name) {
                element.data.name = element.data.originalId;
            }
        })

        return data;
    }
});