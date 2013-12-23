using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;

using Autofac;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Customer.Contracts.Clients;
using Mozu.Core.Collections;
using Mozu.Core.Api.Client;

using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [ErrorFormattingActionFilter]
    public class CmsPagesController : BaseApiController
    {

        protected IDocumentListWebApiClient _docRepo;
        protected IDocumentTypeWebApiClient _docTypeRepo;
        protected ICmsServiceWrapper _cmsService;
        
        protected ICmsTypeHelper _cmsTypeHelper;
        protected ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly HyprViewEngine _hyprViewEngine;
      
     

        public CmsPagesController(
            IDocumentListWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            
            ICmsServiceWrapper cmsService,
            ICmsTypeHelper cmsTypeHelper,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            HyprViewEngine hyprViewEngine

            )
        {

            _docRepo = docRepo;
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            _customerAccountWebApiClient = customerAccountWebApiClient.CloneWithoutUserClaims();
            _cmsTypeHelper= cmsTypeHelper;
            _hyprViewEngine = hyprViewEngine;

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
        public async Task<HttpResponseMessage> Page(string collection, string pageName)
        {


            var pc = this.PageContext;

            

            pc.CmsContext = new CmsPageContext()
                                {
                                    Page = new DocumentRequest()
                                               {
                                                   Path = pageName,
                                                   Collection = collection
                                               }

                                };


            await Task.WhenAll(this.ContextInitilaztionTasks);

            if (pc.CmsContext.Page.Document  == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "page not found");
            }

            var vm = Mapper.Map<DC.Document, VM.Document>(pc.CmsContext.Page.Document ,
                                                          opt => opt.ConstructServicesUsing(this.LifetimeScope .Resolve ));

            SetNavigationContext(vm);

            //pc.WidgetCreationTags.Add(doc.ToWidgetStem());
            pc.CollectionId = collection;
            pc.DocumentId = pc.CmsContext.Page.Document.Id;
            pc.Title = vm.Properties.GetValue("title") as string;
            pc.MetaDescription = vm.Properties.GetValue("meta_description") as string;
            pc.MetaTitle = vm.Properties.GetValue("meta_title") as string;
            pc.PageType = (string)(vm.Properties.GetValue("page_type")) ?? "cmspage";

           

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

            var result = View("blank-page", vm);
          
            var overrideTemplate = PageContext.CmsContext.Page.Document.Get<string>("template");
            if (!string.IsNullOrEmpty(overrideTemplate))
            {
                var template = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, overrideTemplate, StringComparison.OrdinalIgnoreCase));
                if (template != null)
                {
                    result.ViewName  = template.Template ;    
                }
                
            }


            
            return this.Request.CreateResponse(HttpStatusCode.OK, result);

        }

        /// <summary>
        /// Updates the SiteContext.NavigationContext with the current document.
        /// </summary>
        private void SetNavigationContext(VM.Document doc)
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
        //        DocumentType = "web_page",
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
