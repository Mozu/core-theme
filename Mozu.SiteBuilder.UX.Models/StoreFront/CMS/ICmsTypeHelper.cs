// -----------------------------------------------------------------------
// <copyright file="ICmsTypeHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using C = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.CMS
{
    using System.Collections.Generic;
    using Mvc.Models.CMS;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public interface ICmsTypeHelper
    {
        Mozu.Content.Contracts.DocumentType GetDocumentType(string name);
        Mozu.Content.Contracts.PropertyType GetPropertyType(string name);
        IEnumerable<PageTypeDefinition> GetPageTypeDefinitions();
        WidgetDefintion GetWidgetDefintion(string id);
        PageTypeDefinition GetPageTypeDefinition(string id);
    }
}
