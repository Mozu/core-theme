using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Collections;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class CmsPagesController : BaseController
    {

        protected IDocumentWebApiClient _docRepo;
        protected IDocumentTypeWebApiClient _docTypeRepo;
        protected ICmsServiceWrapper _cmsService;
        protected ISiteBuilderContext _context;
        protected ICmsTypeHelper _cmsTypeHelper;
        private ILifetimeScope _lifetimeScope;
        private readonly IViewEngine _viewEngine;

        public CmsPagesController(
            IDocumentWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            ISiteBuilderContext context,
            ICmsServiceWrapper cmsService,
            ICmsTypeHelper cmsTypeHelper,
            IViewEngine viewEngine,
            ILifetimeScope lifetimeScope 

            )
        {

            _docRepo = docRepo;
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            _context = context;
            _cmsTypeHelper= cmsTypeHelper;
            _viewEngine = viewEngine;
            _lifetimeScope = lifetimeScope;
        }





        public ActionResult Index()
        {
            
            return View();
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
        [HttpGet]
        public async Task<ActionResult> Page(string collection, string pageName)
        {
            

            var pc = this.SiteContext.PageContext;

            pc.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest(){
                    Path=pageName,
                    Collection = collection
                } 
                
            };
            await this.AsyncInitData();

            if (pc.CmsContext.Page.Document == null)
                return new HttpNotFoundResult("not found");

            var vm = Mapper.Map<DC.Document, VM.Document>(pc.CmsContext.Page.Document ,
                                                          opt => opt.ConstructServicesUsing(_lifetimeScope .Resolve ));

            SetNavigationContext(vm);

            //pc.WidgetCreationTags.Add(doc.ToWidgetStem());
            pc.CollectionId = collection;
            pc.DocumentId = pc.CmsContext.Page.Document.Id;
            pc.Title = vm.Properties.GetValue("title") as string;
            pc.MetaDescription = vm.Properties.GetValue("meta_description") as string;
            pc.MetaTitle = vm.Properties.GetValue("meta_title") as string;
            pc.PageType = (string)(vm.Properties.GetValue("page_type")) ?? "cmspage";

            var template = ((string)(vm.Properties.GetValue("template")) ?? this.HttpContext.Request["template"] ?? "page");


            if (!this.SiteContext.IsEditMode   )
            {
                if (pc.CmsContext.Page.Document.Get<bool>("hidden", false))
                {
                    return new HttpNotFoundResult("not found");
                }
                string redir;

                if (pc.CmsContext.Page.Document.TryGet<string>("redirect_url", out redir) && !string.IsNullOrEmpty(redir))
                {
                    return this.Redirect(redir);
                }
            }



            //return View(template, vm);
            var vr = _viewEngine .FindView(this.ControllerContext, template, null, true);
            if (vr.View == null)
            {
                vr = _viewEngine.FindView(this.ControllerContext, "blankpage", null, true);
            }
            var result = View(vr.View, vm);

            return result;
        }

        /// <summary>
        /// Updates the SiteContext.NavigationContext with the current document.
        /// </summary>
        private void SetNavigationContext(VM.Document doc)
        {
            _context.Navigation.SetContext(doc);
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
