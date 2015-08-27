using System.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.Tags;
using NDjango.Interfaces;
using System.Collections.Generic;
using System;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{

    /// <summary>
    /// outputs the additional content managed in either the page/template/sitetemplate extended header content section of the properties editor.
    /// used for adhoc style and script tags.
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [Name("header_content")]
    public class HeaderContent : SimpleTagBase
    {
        private const string extended_header_content = "extended_header_content";
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var cmsContext = context.PageContext().CmsContext;
            if (cmsContext == null)
            {
                return Enumerable.Empty<WalkResult>();
            }

            var strings =
                new[] {cmsContext.SiteTemplate, cmsContext.Template, cmsContext.Page}.Select(
                    x => x.Document.Get<string>(extended_header_content));

            using (var poolSb = StringBuilderPool.Default.GetContainer())
            {
                var sb = poolSb.Item;
                foreach (var s in strings)
                {
                    sb.Append(s);
                }
                return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
            }
        }
    }
}