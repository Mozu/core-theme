using Autofac;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcementAttribute]
    public class CmsPagesController : BaseApiController
    {

        protected IDocumentListWebApiClient _docRepo;
        protected IDocumentTypeWebApiClient _docTypeRepo;
        protected ICmsServiceWrapper _cmsService;
        
        //protected ICmsTypeHelper _cmsTypeHelper;
        
        private readonly HyprViewEngine _hyprViewEngine;
        private readonly ISiteRouteHandler _siteRouteHandler;


        public CmsPagesController(
            IDocumentListWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            
            ICmsServiceWrapper cmsService,
            //ICmsTypeHelper cmsTypeHelper,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            HyprViewEngine hyprViewEngine,
            ISiteRouteHandler siteRouteHandler

            )
        {

            _docRepo = docRepo.CloneWithoutUserClaims();
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            
            //_cmsTypeHelper= cmsTypeHelper;
            _hyprViewEngine = hyprViewEngine;
            _siteRouteHandler = siteRouteHandler;
        }

     

        
       

      

        //
      
        //class myOpts :IMappingOperationOptions
        //{
        //    public Func<Type, object> Resolver;
        //    public void ConstructServicesUsing(Func<Type, object> constructor)
        //    {
                
        //    }

        //    public bool CreateMissingTypeMaps { get; set; }
        //}
        //
        // GET: /StoreFront/Details/5
        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> ContentIndex(string list,string listView= null)
        {
            //todo move to actoin
            var resp= _siteRouteHandler.ProcessSeoRedirect();
            if (resp != null)
            {
                return resp;
            }

            var pageType = SiteContext.Theme.PageTypes.FirstOrDefault(x => x.ListFQN == list && string.Equals(x.EntityType, "contentIndex", StringComparison.OrdinalIgnoreCase));
            var template = pageType != null ? pageType.Template : "document-list";




            this.PageContext.CmsContext = new CmsPageContext()
                                          {
                                              Page = new DocumentRequest()
                                                     {
                                                         Path = list + (!string.IsNullOrEmpty(listView) ? "-" + listView : "") + ".index",
                                                         ListFQN = "pages@mozu"
                                                     },
                                              Template = new DocumentRequest
                                                         {
                                                             Path = template
                                                         }
                                   
                                          };

         
            await Task.WhenAll(this.ContextInitilaztionTasks);
            if (this.PageContext.CmsContext.Page.Document != null)
            {
                PageTypeDefinition pageDefinition = null;
                var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
                if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
                {
                    pageDefinition = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));


                }

                //if (pageDefinition == null)
                //{
                //    pageDefinition = this.SiteContext.Theme.PageTypes.Where(x =>
                //        !string.IsNullOrEmpty(x.Template)
                //        &&
                //        (!string.IsNullOrEmpty(x.DocumentTypeFQN) || !string.IsNullOrEmpty(x.ListFQN))
                //        &&
                //        (string.IsNullOrEmpty(x.DocumentTypeFQN) || string.Equals(x.DocumentTypeFQN, vm.DocumentTypeFQN, StringComparison.OrdinalIgnoreCase))
                //        &&
                //        (string.IsNullOrEmpty(x.ListFQN) || string.Equals(x.ListFQN, vm.ListFQN, StringComparison.OrdinalIgnoreCase))
                //        ).OrderByDescending(
                //            x =>
                //            {
                //                return ((string.IsNullOrEmpty(x.DocumentTypeFQN) ? 0 : 1)) + ((string.IsNullOrEmpty(x.ListFQN) ? 0 : 2));
                //            }
                //        ).ToList().FirstOrDefault();
                //    ;
                //}
                template = pageDefinition != null ? pageDefinition.Template : template;

            }



            this.PageContext.PageType = "documentList";
            this.PageContext.ListName = list;
            this.PageContext.ListViewName = listView;

            await Task.WhenAll(this.ContextInitilaztionTasks);
           
            var view = View(template, new {listFQN=list});

            return this.Request.CreateResponse(HttpStatusCode.OK, view);

        }

        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> Page(string list, string name)
        {
            //todo move to actoin
            var resp = _siteRouteHandler.ProcessSeoRedirect();
            if (resp != null)
            {
                return resp;
            }

            var pc = this.PageContext;

            

            pc.CmsContext = new CmsPageContext()
                                {
                                    Page = new DocumentRequest()
                                               {
                                                   Path = name,
                                                   ListFQN = list
                                               }

                                };


            await Task.WhenAll(this.ContextInitilaztionTasks);

            if (pc.CmsContext.Page.Document  == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "page not found");
            }

           



            var vm = pc.CmsContext.Page.Document;

            SetNavigationContext(vm);

            //pc.WidgetCreationTags.Add(doc.ToWidgetStem());
            pc.ListName = list;
            pc.DocumentId = pc.CmsContext.Page.Document.Id;
            pc.Title = vm.Get<string>("title") as string;
            pc.MetaDescription = vm.Get<string>("meta_description") as string;
            pc.MetaTitle = vm.Get<string>("meta_title") as string;
            pc.PageType = (string) (vm.Get<string>("page_type"));


           

            if (!this.PageContext.IsEditMode   )
            {
                if (pc.CmsContext.Page.Document.Get<bool>("hidden", false))
                {
                    return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, " not found");
                }
                string redir;

                if (pc.CmsContext.Page.Document.TryGet<string>("redirect_url", out redir) && !string.IsNullOrEmpty(redir))
                {
                    return this.Request.CreateResponse(HttpStatusCode.OK, this.Redirect(redir));
         
                    ;
                }
            }

         
            PageTypeDefinition pageDefinition = null;

            var pageTypeDefinitionKey = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition");
            if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
            {
                pageDefinition = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                
                
            }
            if (pageDefinition == null)
            {
                pageDefinition = this.SiteContext.Theme.PageTypes.Where(x =>
                    !string.IsNullOrEmpty(x.Template)
                    &&
                    (!string.IsNullOrEmpty(x.DocumentTypeFQN) || !string.IsNullOrEmpty(x.ListFQN))
                    &&
                    (string.IsNullOrEmpty(x.DocumentTypeFQN) || string.Equals(x.DocumentTypeFQN, vm.DocumentTypeFQN, StringComparison.OrdinalIgnoreCase))
                    &&
                    (string.IsNullOrEmpty(x.ListFQN) || string.Equals(x.ListFQN, vm.ListFQN, StringComparison.OrdinalIgnoreCase))
                    ).OrderByDescending(
                        x =>
                        {
                            return ((string.IsNullOrEmpty(x.DocumentTypeFQN) ? 0 : 1)) + ((string.IsNullOrEmpty(x.ListFQN) ? 0 : 2));
                        }
                    ).ToList().FirstOrDefault();
                ;
            }
            var template = pageDefinition != null ? pageDefinition.Template : "blank-page";


            if (PageContext.CmsContext.Template == null || PageContext.CmsContext.Template.Path != template)
            {
                this.PageContext.CmsContext.Template = new DocumentRequest()
                                                       {
                                                           Path = template
                                                       };
               

            }



            var result = View(template, vm);

            
            return this.Request.CreateResponse(HttpStatusCode.OK, result);

        }

        /// <summary>
        /// Updates the SiteContext.NavigationContext with the current document.
        /// </summary>
        private void SetNavigationContext(Document doc)
        {
            NavigationContext.SetContext(doc);
        }

        //
        // GET: /StoreFront/Create

        //public ActionResult Create(string collection, string pageName)
        //{
        //    var doc = new DC.Document()
        //    {
        //        Id = Guid.NewGuid().ToString(),
        //        DocumentTypeFQN = "web_page",
        //        Properties = new List<DC.PropertyValue>(),
        //        Name = pageName
        //    };

        //    _docRepo.Create(collection, doc).Wait();
        //    return RedirectToRoute("StoreFront_pages", new { pageName = pageName });

        //}




        //
        // POST: /StoreFront/Create

        //[HttpPost]
        //public ActionResult Create(FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add insert logic here

        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}

        //
        // GET: /StoreFront/Edit/5

        //public ActionResult Edit(int id)
        //{
        //    return View();
        //}

        //
        // POST: /StoreFront/Edit/5


        //
        // GET: /StoreFront/Delete/5

        //public ActionResult Delete(int id)
        //{
        //    return View();
        //}

        //
        // POST: /StoreFront/Delete/5

        //[HttpPost]
        //public ActionResult Delete(int id, FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add delete logic here

        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}
    }
}
