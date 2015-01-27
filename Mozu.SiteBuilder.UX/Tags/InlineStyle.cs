using System;
using System.Net;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using NDjango.Interfaces;
using System.Collections.Generic;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.UX.Tags
{
    /// <summary>
    /// simular to the style filter although instead outputs all the css rules inline.   Used primarily for email templates
    /// </summary>
    [Name("inline_style")]
    public class InlineStyle : SimpleTagBase
    {
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            try
            {
                var controller = context.Resolve<ResourceController>();
                controller.RequestContext = context.ViewContext().RequestMessage.GetRequestContext();
                controller.Request = context.ViewContext().RequestMessage;
                var path = (string)arguments[0].Value;

                var result = controller.Stylesheets(path);
                if (result.StatusCode != HttpStatusCode.OK)
                {
                    return new[] {WalkResultHelpers.Buffer("error rendering stylesheet " + path)};
                }

                var oc = result.Content as ObjectContent<ResourceController.MozuVirtualFileResult>;
                var fileResult = (ResourceController.MozuVirtualFileResult)oc.Value;
                using (var stream = new System.IO.MemoryStream())
                {
                    fileResult.WriteFile(stream);
                    stream.Position = 0;
                    using (var sr = new System.IO.StreamReader(stream, System.Text.Encoding.UTF8))
                    {
                        return new[] { WalkResultHelpers.Buffer(sr.ReadToEnd()) };
                    }
                }
            }
            catch (Exception e)
            {
                return new[] { WalkResultHelpers.Buffer("error rendering stylesheet") };
            }
        }
    }
}