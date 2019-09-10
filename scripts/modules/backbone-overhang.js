define([
  'modules/backbone-mozu',
  'underscore',
  'modules/jquery-mozu',
  'vendor/jqueryui/jqueryui-effects',
  'shim!vendor/overhang/lib/overhang[modules/jquery-mozu=$]>jQuery'
], function(Backbone, _, $){

  /*
    A backbone model layer for the Overhang.js tool. See cookie-notice.js for usage.
    Overhang lets you load it up with raw HTML; this backbone layer allows you
    to specify a title and text without having the write the HTML for it.
    All other options are loaded right from the model into the Overhang config;
    see the readme file in scripts/vendor/overhang for examples: colors, duration, etc.
    This model has no associated view as Overhang generates the notice on top of
    the specified element.
    Our overhang.less file is a modification of the original to put the notice
    on the bottom of the screen and modify text sizes. The original css file is
    stored in the scripts/vendor/overhang/lib.
  */

  var OverhangModel = Backbone.MozuModel.extend({
    defaults: {
        closeConfirm: true,
        type: 'info',
        title: '',
        text: '',
        primary: '#444',
        accent: '#222',
        textColor: '#FFF',
        element: 'body'
    },
    initialize: function(){
        var overhangConfig = this.toJSON();
        var html = false;
        var message = '';
        if (this.get('message')){
          html = true;
          message = this.get('message');
        } else if (this.get('title') && this.get('text')){
          html = true;
          var title = this.get('title') ? '<p style="color:'+this.get('textColor')+'; font-size:18px">'+this.get('title')+'</p>' : '';
          var text = this.get('text') ? '<p style="font-size:14px">'+this.get('text')+'</p>' : '';
          message = title + text;
        }
        else {
          message = this.get('text') ? this.get('text') : this.get('title');
        }
       delete overhangConfig.title;
       delete overhangConfig.text;
       overhangConfig.message = message;
       overhangConfig.html = html;
       overhangConfig.custom = true;
       this.set('overhangConfig', overhangConfig);
    },
    open: function(){
      $(this.get('element')).overhang(this.get('overhangConfig'));
    }
  });

  return OverhangModel;

});
