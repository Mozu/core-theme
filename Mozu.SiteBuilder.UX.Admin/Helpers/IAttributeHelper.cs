using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface IAttributeHelper
    {
        Task<IEnumerable<Attribute>> GetAttributes(PagingParamaters pagingParams, FilterCollection extFilter);

        Task<IEnumerable<Attribute>> CreateAttributes(List<Attribute> attributes);

        Task<IEnumerable<Attribute>> EditAttributes(List<Attribute> attributes);

        Task<IEnumerable<Attribute>> DeleteAttributes(List<Attribute> attributes);
    }
}