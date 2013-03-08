using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    public interface IAttributeHelper
    {
        Task<Attribute> GetAttribute(string id);

        Task<IEnumerable<Attribute>> GetAttributes(PagingParamaters pagingParams, FilterCollection extFilter);

        Task<IEnumerable<Attribute>> CreateAttributes(List<Attribute> attributes);

        Task<IEnumerable<Attribute>> EditAttributes(List<Attribute> attributes);

        Task<IEnumerable<Attribute>> DeleteAttributes(List<Attribute> attributes);

        
    }
}