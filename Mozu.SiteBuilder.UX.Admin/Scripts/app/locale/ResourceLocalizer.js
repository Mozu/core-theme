Ext.define('Taco.locale.ResourceLocalizer', {
    singleton: true,
    alternateClassName: 'Localizer',
    requires: ['Ext.Ajax'],
    constructor: function (config) {
        var me = this,
            url = '/admin/Scripts/app/locale/' + navigator.language + '.json';
        me.loadLangResouces(url);
    },

    loadLangResouces: function (url) {
        var me = this;
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            async: false,
            headers: { 'Content-Type': 'application/json' },
            success: function (result) {
                me.langResources = JSON.parse(result.responseText);
            },
            failure: function (conn, response, options, eOpts) {
                if (conn.status == 404) {
                    var url = '/admin/Scripts/app/locale/en-US.json';
                    me.loadLangResouces(url);
                } else {
                    Ext.Msg.alert('Error localization');
                }
            }
        });
    }
});