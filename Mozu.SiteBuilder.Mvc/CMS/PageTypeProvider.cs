using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class PageTypeProvider : DefinitionProvider<PageTypeDefinition>, IPageTypeProvider
    {
        public PageTypeProvider(DjangoMozuViewEngine viewEngine, ISiteBuilderContext ctx) : base(viewEngine.PathProvider, ctx)
        {
        }

        public IEnumerable<PageTypeDefinition> GetPageTypes()
        {
            // TODO: Cache this or make it static
            return GetFromFolder("metadata").Where(x => !string.IsNullOrWhiteSpace(x.Id));
        }
    }
}