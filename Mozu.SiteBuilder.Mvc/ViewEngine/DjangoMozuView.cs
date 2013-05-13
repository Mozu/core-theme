using System;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using Autofac;
using NDjango;
using NDjango.Interfaces;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public interface IViewPathContainer
    {
        string ViewPath
        {
            get;
        }
    }



    //interface ITemplateManagerProvider
    //{
    //    ITemplateManager GetManager(HttpContextBase ctx);
    //}
    //public class TemplateManagerProvider:ITemplateManagerProvider
    //{
    //    private readonly ISiteBuilderContext _siteBuilderContext;
        
    //    public TemplateManagerProvider(ISiteBuilderContext siteBuilderContext)
    //    {
    //        _siteBuilderContext = siteBuilderContext;
    //    }

    //    public ITemplateManager GetManager(HttpContextBase ctx)
    //    {
    //        var sbc = SiteBuilderContext.GetFromContext(ctx);

    //        var key = sbc.Theme.Id;

    //        ITemplateManager manager = null;
    //        manager = (ITemplateManager) _cache[key];
    //        if (manager == null)
    //        {
    //            lock (_cache)
    //            {
    //                manager = (ITemplateManager)_cache[key];
    //                if (manager == null)
    //                {
    //                    manager = sbc.Resolve<ITemplateManager>();
    //                    _cache[key] = manager;
    //                }
    //            }
    //        }
    //        return manager;
    //    }
    //}

    class DjangoMozuView : IView, IViewDataContainer, IViewPathContainer
    {
        private static  System.Collections.Hashtable _cache = new Hashtable(StringComparer.OrdinalIgnoreCase);
        internal string viewPath;
        private readonly string _mappedPath;

        public DjangoMozuView(ITemplateManager manager, string viewPath, string mappedPath)
        {
            // TODO: Complete member initialization
            //this.TemplateManager = manager;
      
            this.viewPath = viewPath;
            _mappedPath = mappedPath;
        }

        public string ViewPath
        {
            get { return viewPath; }
        }

        //public ITemplateManager TemplateManager
        //{
        //    get;
        //    private set;
        //}

        public ITemplateManager GetManager(HttpContextBase ctx)
        {
            var sbc = SiteBuilderContext.GetFromContext(ctx);

            var key = sbc.Theme.Id;

            ITemplateManager manager = null;
            manager = (ITemplateManager)_cache[key];
            if (manager == null)
            {
                lock (_cache)
                {
                    manager = (ITemplateManager)_cache[key];
                    if (manager == null)
                    {
                        var provider = sbc.Resolve<TemplateManagerProvider>();
                        _cache[key] = manager = provider.GetNewManager();
                    }
                }
            }
            return manager;
        }



        public ViewDataDictionary ViewData
        {
            get;
            set;
        }

        public void Render(ViewContext viewContext, System.IO.TextWriter writer)
        {
            ViewData = viewContext.ViewData;
            var siteBuilderContext = SiteBuilderContext.GetFromContext(viewContext.HttpContext ) ?? SiteBuilderContext.Current;
            var requestContext = new Dictionary<string, object>(viewContext.ViewData);
            var authenticationHelper = new AuthenticationHelper(viewContext.HttpContext, new CookieProvider(viewContext.HttpContext,Core.Settings.MozuConfigurationManager.Settings));
            var gcu = authenticationHelper.GetCurrentUser();
            var profile = authenticationHelper.GetCurrentProfileToken();
            HtmlHelper html;
            var user = new Mozu.SiteBuilder.UX.Models.Customers.User()
            {
                Email = profile != null ? profile.EmailAddress : null,
                FirstName = profile != null ? profile.FirstName : null,
                LastName = profile != null ? profile.LastName : null,
                UserId = gcu.UserId,
                IsAuthenticated = !gcu.IsAnonymous && gcu.IsAuthenticated,
                IsAnonymous = gcu.IsAnonymous
            };
            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"] = (System.Collections.Hashtable)viewContext.HttpContext.Items["templateVariables"] ?? new System.Collections.Hashtable(StringComparer.OrdinalIgnoreCase);
            requestContext["Html"] = requestContext["html"] = html = new HtmlHelper(viewContext, this);
            requestContext["ViewData"] = requestContext["viewData"] = viewContext.ViewData;
            requestContext["Model"] = requestContext["model"] = viewContext.ViewData.Model;
            requestContext["Session"] = requestContext["session"] = viewContext.HttpContext.Session;
            //requestContext["Templates"] = new TemplateLocator(html, this.TemplateManager);
            requestContext["SiteContext"] = requestContext["siteContext"] = siteBuilderContext;
            requestContext["ThemeSettings"] = requestContext["themeSettings"] = siteBuilderContext.ThemeSettings;
            requestContext["PageContext"] = requestContext["pageContext"] = siteBuilderContext.PageContext;
            requestContext["User"] = requestContext["user"] = user;


          //  this.
          //  var result = ViewEngines.Engines.FindPartialView(_html.ViewContext.Controller.ControllerContext, viewPath);

            var templateManager = GetManager(viewContext.HttpContext);
            var reader = templateManager.RenderTemplate(_mappedPath, requestContext);
            var buffer = new char[4096];
            int count = 0;

            while ((count = reader.Read(buffer, 0, buffer.Length)) > 0)
            {
                writer.Write(buffer, 0, count);
            }
        }

        class TemplateLocator : ITemplate
        {
            ITemplate _innerTemplate;
            bool _templateCreated = false;
            HtmlHelper _html;
            ITemplateManager _templateManager;
            List<string> _nameStack = new List<string>();

            public TemplateLocator(HtmlHelper html, ITemplateManager templateManager)
            {
                _html = html;
                _templateManager = templateManager;
            }

            public TemplateLocator this[string propName]
            {
                get
                {
                    if (_templateCreated)
                    {
                        TemplateLocator loc = new TemplateLocator(_html, _templateManager);
                        loc = (TemplateLocator)loc[propName];
                        return loc;
                    }
                    else
                    {
                        _nameStack.Add(propName);
                        return this;
                    }


                }
            }

          
            ITemplate InnerTemplate
            {
                get
                {
                    _templateCreated = true;
                    if (_innerTemplate == null)
                    {
                        var path = String.Join("/", _nameStack);
                       // var path = this.GetVirtualPath();
                        _innerTemplate = _templateManager.GetTemplate(path);
                    }
                    return _innerTemplate;
                }
            }

            Microsoft.FSharp.Collections.FSharpList<INodeImpl> ITemplate.Nodes
            {
                get { return InnerTemplate.Nodes; }
            }

            System.IO.TextReader ITemplate.Walk(ITemplateManager tmanager, IDictionary<string, object> dic)
            {
                return InnerTemplate.Walk(tmanager, dic);
            }
        }


    }
}
