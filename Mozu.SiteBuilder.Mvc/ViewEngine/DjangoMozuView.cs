using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Autofac;
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

    class DjangoMozuView : IView, IViewDataContainer, IViewPathContainer
    {
    
        internal string viewPath;

        public DjangoMozuView(ITemplateManager manager, ISiteBuilderContext siteBuilderContext, string viewPath)
        {
            // TODO: Complete member initialization
            this.TemplateManager = manager;
      
            this.viewPath = viewPath;
        }

        public string ViewPath
        {
            get { return viewPath; }
        }

        public ITemplateManager TemplateManager
        {
            get;
            private set;
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
            var authenticationHelper = new AuthenticationHelper( viewContext.HttpContext , new CookieProvider(viewContext.HttpContext));
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

            var reader = TemplateManager.RenderTemplate(viewPath, requestContext);
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

            string GetVirtualPath()
            {
                var path = String.Join("/", _nameStack);
                var result = ViewEngines.Engines.FindPartialView(_html.ViewContext.Controller.ControllerContext, path);
                if (result.View != null)
                {
                    return ((DjangoMozuView)result.View).viewPath;
                }
                return path;

            }

            ITemplate InnerTemplate
            {
                get
                {
                    _templateCreated = true;
                    if (_innerTemplate == null)
                    {
                        var path = this.GetVirtualPath();
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
