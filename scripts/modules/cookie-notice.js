define([
  'modules/backbone-mozu',
  'underscore',
  'modules/jquery-mozu',
  'modules/backbone-overhang',
  'hyprlive'
], function(Backbone, _, $, OverhangModel, Hypr){
  $(document).ready(function(){
    var apiContext = require.mozuData('apicontext');
    var tenantId = apiContext.headers['x-vol-tenant'];
    var siteId = apiContext.headers['x-vol-site'];
    var acceptedCookiesNotice = $.cookie('kibo-'+tenantId+'-'+siteId+'-'+'accept-cookies');

    if (!acceptedCookiesNotice) {
      var cookieNoticeTitle = 'Cookie Notice',
          cookieNoticeText = 'This site uses cookies to personalize content. By using this site or accepting cookies you are agreeing to our use of cookies.';
      var cookieNoticeModel = new OverhangModel({
           title: cookieNoticeTitle,
           text: cookieNoticeText,
           type: 'confirm',
           yesMessage: 'Accept Cookies',
           noMessage: 'Learn More',
           yesColor: '#222',
           noColor: '#222',
           callback: function(accepted){
             if (!accepted){
               window.open(Hypr.getLabel('learnMoreCookiesLink'));
             } else {
               $.cookie('kibo-'+tenantId+'-'+siteId+'-'+'accept-cookies', true, { expires: 365 });
             }
           }
       });
       cookieNoticeModel.open();
    }

  });
});
