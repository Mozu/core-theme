// -----------------------------------------------------------------------
// <copyright file="DjangoViewEngine.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web.Mvc;
    using NDjango.Interfaces;
    using NDjango;
    using System.IO;
    using System.Reflection;
    using System.Web;
    using System.Web.Routing;

    public class DjangoMozuViewEngine : VirtualPathProviderViewEngine, NDjango.Interfaces.ITemplateLoader
    {
        public DjangoMozuViewEngine()
        {
            this.TemplateManagerProvider = new NDjango.TemplateManagerProvider().WithLoader(this);
        }


        public DjangoMozuViewEngine(Func<TemplateManagerProvider, NDjango.TemplateManagerProvider> setup)
            : this()
        {
            TemplateManagerProvider = setup(TemplateManagerProvider).WithLoader(this);

            this.VirtualPathProvider = new MozuVirtualPathProvider(this);
            this.TemplateManger = this.TemplateManagerProvider.GetNewManager();
            //server = HttpContext.Current.Server;
        }

        public MozuVirtualPathProvider PathProvider
        {
            get { return (MozuVirtualPathProvider)this.VirtualPathProvider; }
        }

        internal static class AreaHelpers
        {
            // Methods
            public static string GetAreaName(RouteBase route)
            {
                IRouteWithArea area = route as IRouteWithArea;
                if (area != null)
                {
                    return area.Area;
                }
                Route route2 = route as Route;
                if ((route2 != null) && (route2.DataTokens != null))
                {
                    return (route2.DataTokens["area"] ?? route2.Defaults["area"]) as string;
                }
                return null;
            }

            public static string GetAreaName(RouteData routeData)
            {
                object obj2;
                if (routeData.DataTokens.TryGetValue("area", out obj2))
                {
                    return (obj2 as string);
                }
                return GetAreaName(routeData.Route);
            }
        }


        static string[] g_formats = new string[] { "modules/{0}.vol", "{0}.vol" };

        static string[] g_layout_formats = new string[] { "layouts/{0}.vol" };
        static string[] g_template_formats = new string[] { "templates/{0}.vol" };
        static string[] g_widget_formats = new string[] { "widgets/{0}.vol" };


        public override ViewEngineResult FindPartialView(ControllerContext controllerContext, string partialViewName, bool useCache)
        {
            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");

            var formats = string.Equals("widgets", controller, StringComparison.OrdinalIgnoreCase) ? g_widget_formats : g_formats;


            return FindViewInternal(controllerContext, partialViewName, null, useCache, area, formats);
        }



        IEnumerable<string> GetViewVariants(string view, string themeId, ICollection<string> themes)
        {
            yield return view;
            if (themes.Count == 1 || !themeId.Equals(themes.First(), StringComparison.OrdinalIgnoreCase))
            {
                var pos = view.LastIndexOf('/');
                if (pos > -1 && pos + 1 < view.Length)
                {
                    yield return view.Substring(0, pos + 1) + "_" + view.Substring(pos + 1);
                }
                else
                {
                    yield return "_" + view;
                }
            }


        }

        private ICollection<string>  _themeStack;
        public ICollection<string> ThemeStack
        {
            get { return _themeStack ?? SiteBuilderContext.Current.Theme.Stack; }
            set { _themeStack = value; }
        }

        public override ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache)
        {
            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
            var formats = g_template_formats;
            return FindViewInternal(controllerContext, viewName, null, useCache, area, formats);
        }

        public ViewEngineResult FindViewInternal(ControllerContext controllerContext, string viewName, string masterName, bool useCache, string area, string[] formats)
        {

            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");

            string key = null;
            if (useCache)
            {

                key = controller + ";" + viewName + ";" + area + ";" + string.Join(";", ThemeStack);

                string val = (string)System.Runtime.Caching.MemoryCache.Default[key];
                if (!string.IsNullOrEmpty(val))
                {
                    return new ViewEngineResult(this.CreateView(controllerContext, val, null), this);
                }
            }


            var searchedLocations = new List<string>();


            foreach (var format in formats)
            {
                string vpath = string.Format(format, viewName, controller, area);
                searchedLocations.Add(vpath);
                if (this.FileExists(controllerContext, vpath))
                {
                    if (useCache)
                    {

                        System.Runtime.Caching.MemoryCache.Default.Set(key, vpath, DateTimeOffset.Now.AddSeconds(10));
                    }
                    return new ViewEngineResult(this.CreateView(controllerContext, vpath, null), this);
                }
            }
            if (useCache)
            {
                System.Runtime.Caching.MemoryCache.Default.Set(key, string.Empty, DateTimeOffset.Now.AddSeconds(10));

            }



            return new ViewEngineResult(searchedLocations);
        }


        string GetLayoutPath(string relPath)
        {
            var sbCtx = SiteBuilderContext.Current;
            //   List<string> searchedLocations = new List<string>();

            foreach (var format in g_layout_formats)
            {
                foreach (var theme in sbCtx.Theme.Stack)
                {
                    foreach (var rp in GetViewVariants(relPath, theme, sbCtx.Theme.Stack))
                    {
                        string vpath = string.Format(format, rp, null, theme, null);
                        //       searchedLocations.Add(vpath);
                        if (this.FileExists(null, vpath))
                        {
                            return vpath;
                        }
                    }

                }
            }
            return null;
        }




        public NDjango.TemplateManagerProvider TemplateManagerProvider
        {
            get;
            private set;
        }
        //HttpServerUtility server;
        public IEnumerable<KeyValuePair<string, ITag>> InstalledTags
        {
            get
            {
                object tags = this.TemplateManagerProvider.GetType().GetField("tags", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.GetField).GetValue(this.TemplateManagerProvider);

                return (IEnumerable<KeyValuePair<string, ITag>>)tags;
            }
        }
        public IEnumerable<KeyValuePair<string, ISimpleFilter>> InstalledFilters
        {
            get
            {
                object tags = this.TemplateManagerProvider.GetType().GetField("filters", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.GetField).GetValue(this.TemplateManagerProvider);

                return (IEnumerable<KeyValuePair<string, ISimpleFilter>>)tags;
            }
        }

        private ITemplateManager _templateManager;
        public ITemplateManager TemplateManger
        {
            get { return _templateManager; }
            set { _templateManager = value; }
        }

        protected override IView CreatePartialView(ControllerContext controllerContext, string partialPath)
        {
            return CreateView(controllerContext, partialPath, null);
        }

        protected override bool FileExists(ControllerContext controllerContext, string virtualPath)
        {
            return base.FileExists(controllerContext, virtualPath);
        }

        protected override IView CreateView(ControllerContext controllerContext, string viewPath, string masterPath)
        {
            return new DjangoMozuView(TemplateManger, viewPath);
        }




        private string MapPath(string virtual_path)
        {

            return HttpContext.Current.Server.MapPath(virtual_path);

        }




        #region ITemplateLoader Members

        public System.IO.TextReader GetTemplate(string path)
        {
            var vpath = path;
            if (path.IndexOf("/", StringComparison.OrdinalIgnoreCase) == -1)
            {
                vpath = "layouts/" + path;
            }
            if (Path.GetExtension(vpath) == "")
            {
                vpath += ".vol";
            }

            var file = this.VirtualPathProvider.GetFile(vpath);
            if (file == null)
            {
                throw new InvalidOperationException(string.Format("invalid virtual path [{0}]", vpath));
            }
            return new StreamReader(file.Open());
        }

        public bool IsUpdated(string path, DateTime timestamp)
        {
            // var vpath = path.StartsWith("~/themes/") ? path : GetLayoutPath(path);
            if (path.IndexOf("/", StringComparison.OrdinalIgnoreCase) == -1)
            {
                path = "layouts/" + path;
            }
            if (Path.GetExtension(path) == "")
            {
                path += ".vol";
            }
            MozuVirtualFile file = (MozuVirtualFile)this.VirtualPathProvider.GetFile(path);
            return file.GetLastWriteTime() > timestamp;
        }

        #endregion
    }



}
