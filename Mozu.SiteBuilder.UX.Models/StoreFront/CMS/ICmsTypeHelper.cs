// -----------------------------------------------------------------------
// <copyright file="ICmsTypeHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Threading.Tasks;
using Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.CMS
{
    using System.Collections.Generic;
    using Mvc.Models.CMS;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public interface ICmsTypeHelper
    {
        Task<DocumentType> GetDocumentType(string name);
        Task<PropertyType> GetPropertyType(string name);

        IEnumerable<PageTypeDefinition> GetPageTypeDefinitions();
        WidgetDefinition GetWidgetDefintion(string id);
        PageTypeDefinition GetPageTypeDefinition(string id);
    }
}
