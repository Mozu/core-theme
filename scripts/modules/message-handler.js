define(['modules/jquery-mozu', 'underscore', 'backbone', 'hyprlive', 'modules/views-messages', 'modules/models-messages'], function ($, _, Backbone, Hypr, MessageViewFactory, MessageModal) {
    
    var SESSION_KEY= 'MozuMessage';

    var Messages = function() {
        return {
            getMessages: function(){
                var messages = window.sessionStorage.getItem(SESSION_KEY) || "{}";
                try {
                    messages = JSON.parse(messages);
                } catch (error) {
                    messages = {};
                }
                return messages;
            },
            saveMessages: function(messages){
                window.sessionStorage.setItem(SESSION_KEY, messages);
                return messages;
            },
            getMessage: function(key){
                var messages = this.getMessages();
                return messages[key] || null;
            },
            addMessage: function (key, message) {
                var messages = this.getMessages();
                try{
                    messages[key] = (message);
                    this.saveMessages(JSON.stringify(messages));
                }
                catch (error) {
                   
                }
               
                return messages;
            },
            removeMessage: function (key) {
                var messages = this.getMessages();
                delete messages[key];
                try {
                    this.saveMessages(JSON.stringify(messages));
                }
                catch (error) {

                }
                return messages;
            }
        };
    };

    function Handler() {
        var self = this;
        var displayMessage = function(message) {
            if (!self.view){
                self.view  = MessageViewFactory({
                    el: $('.mz-l-pagewrapper').children('[data-mz-message-bar]').first(),
                    model: new MessageModal.MessagesCollection()
                });
            }
            self.view.model.reset(message);
            self.view.listenTo(self.view.model, 'messageDismiss', function(){
                var message = self.view.model.at(0);
                self.Messages.removeMessage(message.get('key'));
            });
            //this.view.render();
            return self.view;
        };

        
        var saveMessage = function(key, type, message){
            self.Messages.addMessage(key, {
                key: key,
                messageType: type,
                message: message
            });
        };

        var showMessage = function(key) {
            var message = self.Messages.getMessage(key);
            if (message) {
                displayMessage(message);
            }
        };

        var dismissMessage = function () {
            var message = self.view.model.at(0);
            if(message){
                self.Messages.removeMessage(message.get('key'));
            }
            self.view.dismissMessage();
        };

        return {
            showMessage: showMessage,
            dismissMessage: dismissMessage,
            saveMessage: saveMessage
        };
    }

    Handler.prototype.Messages = Messages();

    return new Handler();

});