using System;
using System.Net;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using NDjango.Interfaces;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;
using NDjango.FiltersCS.Compatibility;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
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
                var fact = ActivatorUtilities.CreateFactory(typeof(ResourceController), Type.EmptyTypes);
                var controller = (ResourceController)fact(context.ViewContext().LifetimeScope,  arguments: null);
                controller.ControllerContext.HttpContext = context.HttpContext();
                //controller.RequestContext = context.ViewContext().RequestMessage.GetRequestContext();
                //controller.Request = context.ViewContext().RequestMessage;
                var path = (string)arguments[0].Value;

                if (!(controller.Stylesheets(path) is ResourceController.MozuVirtualFileResult result))
                {
                    return new[] {WalkResultHelpers.Buffer("error rendering stylesheet " + path)};
                }

                using var stream = new System.IO.MemoryStream();
                result.WriteFile(stream);
                stream.Position = 0;
                using var sr = new System.IO.StreamReader(stream, System.Text.Encoding.UTF8);
                return new[] { WalkResultHelpers.Buffer(sr.ReadToEnd()) };
            }
            catch (Exception ex)
            {
                return new[] { WalkResultHelpers.Buffer("error rendering stylesheet") };
            }
        }
    }
}