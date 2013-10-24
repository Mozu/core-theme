using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

using Autofac;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    public static class NDjangoContextExtensions
    {
        public static HyprViewContext ViewContext(this NDjango.Interfaces.IContext context)
        {
            return (HyprViewContext)context.tryfind("_vc").Value;
        }
        public static HttpContextBase HttpContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().HttpContext;
        }
        public static T GetValueOrDefault<T>(this NDjango.Interfaces.IContext context, string key )
        {
            var entry = context.tryfind("key");
            if (entry != null)
            {
                var value = entry.Value;
                if (value is T)
                {
                    return (T) value;
                }
                return (T)Convert.ChangeType(value, typeof(T));

            }
            return default(T);
        }

        public static object Model(this NDjango.Interfaces.IContext context)
        {
            var ret = context.tryfind("model");
            if (ret != null)
            {
                return ret.Value;
            }
            return null;
        }
        public static ISiteBuilderApiContext SiteBuilderApiContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<ISiteBuilderApiContext>();
        }
        public static ISiteBuilderContext SiteBuilderContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<ISiteBuilderContext>();
        }
        public static PageContext PageContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<PageContext>();
        }
        public static SiteContext SiteContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<SiteContext>();
        }
        public static T Resolve<T>(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<T>();
        }
        public static string Render(this NDjango.Interfaces.IContext context, string viewName, object model)
        {
            var writer = new StringWriter();

            context.Render(viewName, model, writer);
            return writer.GetStringBuilder().ToString();
        }

        public static void Render(this NDjango.Interfaces.IContext context, string viewName, object model, TextWriter writer )
        {
          
            var viewContext = context.ViewContext();

            var viewEngine = viewContext.LifetimeScope.Resolve<HyprViewEngine>();


            var view = viewEngine.FindModuleView(viewName);
            var viewData = new ViewDataDictionary()
            {
                Model = model
            };
            var hvc = new HyprViewContext(viewContext.RequestMessage , viewData, viewContext);
            if (view == null)
            {
                writer.Write("view not found: (" + viewName + ")");
            }
            view.Render(hvc, writer);

           
        }
    }
}
