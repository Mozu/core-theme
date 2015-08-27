/**
 * @class Taco.view.error.Http404
 */
    Ext.define('Taco.view.error.Http404', {
        extend: 'Taco.core.ux.content.Container',
        initComponent: function () {
            var me = this;
            me.header = {
                title: '404'
            };
            me.body = {
                html: [
                    '<div class="{0}view-error">',
                    '<h1>Sorry, we can\'t find the page you are trying to view.</h1>',
                    '<h2>Here are some options for finding what you are looking for...</h2>',
                    '<ul>',
                    '  <li>Select a different page from the navigation menu</li>',
                    '  <li>Return to the previous page by using your browser\'s back button</li>',
                    '</ul>',
                    '<h2>Did you follow a link from within the Mozu Admin?</h2>',
                    '<p>If you reached this page from another area of the Admin, please email <a href="mailto:support@mozu.com">support@mozu.com</a> so we can correct the link.</p>',
                    '<h2>Did you type the address of the page?</h2>',
                    '<p>You may have entered the address incorrectly. Check that you have the exact spelling and try again.</p>',
                    '</div>'
                ]
                        .join('')
                        .split('{0}')
                        .join(Taco.baseCSSPrefix)
            };
            me.callParent(arguments);
        }
    });
