using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Json;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using AutoMapper;
using Microsoft.FSharp.Collections;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NDjango.Interfaces;
using Microsoft.FSharp.Core;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{

    /// <summary>
    /// outputs the additional content managed in either the page/template/sitetemplate extended header content section of the properties editor.
    /// used for adhoc style and script tags.
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("header_content")]
    public class HeaderContent : SimpleTagBase
    {


        private const string extended_header_content = "extended_header_content";

        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;

            var cmsContext = context.PageContext().CmsContext;
            if (cmsContext == null)
            {
                return;
            }
            var sb = new StringBuilder();
            var cnt = cmsContext.SiteTemplate.Document.Get<string>(extended_header_content);
            sb.Append(cnt);
            cnt = cmsContext.Template.Document.Get<string>(extended_header_content);
            sb.Append(cnt);
            cnt = cmsContext.Page.Document.Get<string>(extended_header_content);
            sb.Append(cnt);

            buffer = sb.ToString();
        }

    }
}