using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;

namespace Mozu.SiteBuilder.UX.Tags
{
    /// <summary>
    /// simular to the style filter although instead outputs all the css rules inline.   Used primarily for email templates
    /// </summary>
    [NDjango.Interfaces.Name("inline_style")]
    public class InlineStyle : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            try
            {
                var controller = context.Resolve<ResourceController>();

              
                controller.RequestContext = context.ViewContext().RequestMessage.GetRequestContext();
                controller.Request = context.ViewContext().RequestMessage;
                var path = (string)arguments[0].Value;

                var result = controller.Stylesheets(path);
                if (result.StatusCode != HttpStatusCode.OK)
                {
                    buffer = "error rendering stylesheet " + path;
                    return;
                }
                var oc = result.Content as ObjectContent<ResourceController.MozuVirtualFileResult>;
                var fileResult = (ResourceController.MozuVirtualFileResult)oc.Value;
                var stream = new System.IO.MemoryStream();
                fileResult.WriteFile(stream);
                stream.Position = 0;
                //
                var sr = new System.IO.StreamReader(stream, System.Text.Encoding.UTF8);
                buffer = sr.ReadToEnd();
            }
            catch (Exception e)
            {
                buffer = "error rendering stylesheet";
            }
        }
    }
}