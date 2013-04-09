/**
 * @class Taco.core.data.ReadAheadProxy
 */
Ext.define('Taco.core.data.RemoteException', {
    constructor: function(config) {
        if (config.response) {
            this.data = Ext.decode(config.response.responseText, true);

        }


    },
    getMessage:function (){
        if (this.data && this.data.ExceptionDetail) {
            return this.data.ExceptionDetail.Message;
        }
        return null;
    },
    getErrorCode: function() {
        if (this.data && this.data.Items && this.data.Items.length) {
            return this.data.Items[0].ErrorCode;
        }
        return null;
    }

});
   