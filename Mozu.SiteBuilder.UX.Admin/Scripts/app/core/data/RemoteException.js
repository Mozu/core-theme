/**
 * @class Taco.core.data.ReadAheadProxy
 */
Ext.define('Taco.core.data.RemoteException', {
    constructor: function(config) {
        if (config.response) {
            this.data = Ext.decode(config.response.responseText, true);

        }


    },
    getError:function (option) {
        return Ext.create('Ext.Error',{
            msg: this.getMessage(),
            option: option ,   // whatever was passed into the method
            'error code':  this.getErrorCode() // other arbitrary info
        });
    },
    getMessage:function (){
        if (this.data && this.data.exceptionDetail) {
            return this.data.exceptionDetail.message;
        }
        if (this.data && this.data.exceptionMessage) {
            return this.data.exceptionMessage;
        }
        if (this.data && this.data.message) {
            return this.data.message;
        }
        return null;
    },
    getErrorCode: function() {
        if (this.data && this.data.items && this.data.items.length) {
            return this.data.items[0].errorCode;
        }
        return null;
    }

});
   