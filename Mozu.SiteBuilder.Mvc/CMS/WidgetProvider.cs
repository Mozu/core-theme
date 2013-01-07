using System.Collections.Generic;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class WidgetProvider : DefinitionProvider<WidgetDefintion>, IWidgetProvider
    {
        public WidgetProvider(DjangoMozuViewEngine viewEngine, ISiteBuilderContext ctx) : base(viewEngine.PathProvider, ctx)
        {
        }

        public IEnumerable<WidgetDefintion> GetWidgets()
        {
            // TODO: Cache this or make it static
            return GetFromFolder("widgets");
        }
    }
}
