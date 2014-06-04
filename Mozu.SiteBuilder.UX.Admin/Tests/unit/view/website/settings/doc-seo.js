StartTest(function (t) {
    var m = {};

    //Bug 28406:SEO fields missing for CMS pages in Site Builder

    m.doc = Ext.create('Taco.model.CmsDocument', {
            "id": "pages_7302a618-c6a1-4156-b1d9-f222bb00fce0",
            "documentType": "web_page",
            "name": "seo-name",
            "documentId": "7302a618-c6a1-4156-b1d9-f222bb00fce0",
            "collectionName": "pages",
            "publishState": "draft",
            "items": [
                {
                    "key": "link_title",
                    "value": "Sample page"
                }, {
                    "key": "meta_description",
                    "value": "test meta descriptoin"
                }, {
                    "key": "meta_title",
                    "value": "test meta title"
                }, {
                    "key": "page_type_definition",
                    "value": "blank-page"
                }, {
                    "key": "template",
                    "value": "blank-page"
                }, {
                    "key": "title",
                    "value": "Sample page"
                }
            ]
        });
    t.setOnlyMocks();
    t.simManager().register([
       
        {
            url: '/admin/app/cmsdocument/update',
            stype: 'json',
            getData: function () {
                return [
                    {
                       
                    }
                ];
            },
            doPost: function () {
                return this.doGet.apply(this, arguments);
            }
        }
    ]);

   

    
    t.chain(

        function (next) {
            Taco.app.viewPort.removeAll(true);
            m.docSeoForm = Ext.create(
                'Taco.view.website.settings.DocumentSeo', { record: m.doc , width:500}
            );
            Taco.app.viewPort.add(m.docSeoForm);

            t.waitForComponentVisible(m.docSeoForm, next);
         
        },
        function (next) {
            t.validateFormValues(m.docSeoForm, {
                "meta_title": "test meta title",
                "meta_description": "test meta descriptoin",
                "name": "seo-name"
            });

            t.setFormValues(m.docSeoForm, {
                "meta_title": "test meta title2",
                "meta_description": "test meta descriptoin2",
                "name": "seo-name2"
            }, next);
        },
        function(next){
          
            t.waitForEvent(m.docSeoForm, 'savesuccess', next);
            m.docSeoForm.save();
            
        },
        function (next) {
            t.is(m.doc.get('name'), "seo-name2", 'the model name was set propertly');

            t.is(m.doc.get('meta_description'), "test meta descriptoin2", 'the model description was set propertly');

            t.is(1,2,'I am a test failure');

        }
    );


});