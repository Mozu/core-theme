// -----------------------------------------------------------------------
// <copyright file="ParentTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Generic;
using System.Linq;
using NDjango;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///     TODO: Update summary.
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("parent")]
    public class ParentTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = "";
            var block = context.tryfind("block");
            templateName = null;
            return;
        }
    }
}