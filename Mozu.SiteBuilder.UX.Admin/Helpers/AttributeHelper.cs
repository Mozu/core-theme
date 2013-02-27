using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    using Contracts = ProductAdmin.Contracts;

    public class AttributeHelper : IAttributeHelper
    {
        private readonly IMoreAwesomeAttributeWebApiClient _attributeWebApiClient;
        private readonly CollectionTaskUnMapper<Attribute, Contracts.Attribute> _attributeMapper = new CollectionTaskUnMapper<Attribute, Contracts.Attribute>();
        private readonly CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue> _attributeValueMapper = new CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue>();

        public AttributeHelper(IMoreAwesomeAttributeWebApiClient attributeWebApiClient)
        {
            _attributeWebApiClient = attributeWebApiClient;
        }

        public async Task<IEnumerable<Attribute>> GetAttributes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            string filter = null; // extFilter.ToFilterString();
            string sort = null;   // pagingParams.sort.ToSortString();

            var result = await _attributeWebApiClient.GetAttributes(
                /* startIndex:     */ pagingParams.startIndex,
                /* pageSize:       */ pagingParams.pageSize,
                /* sortBy:         */ sort,
                /* responseGroups: */ null,
                /* filter:         */ filter
                );
            var res = result.ReadAsAsync().Result;

            return res.Items.Select(Mapper.Map<Attribute>);
        }

        public async Task<IEnumerable<Attribute>> CreateAttributes(List<Attribute> attributes)
        {
            var results = await _attributeMapper.PerformAction(attributes, a => _attributeWebApiClient.AddAttribute(a));
            await _attributeValueMapper.PerformAction(results.SelectMany(SelectValuesAssigned), (a, b) => _attributeWebApiClient.AddAttributeVocabularyValue(a, b.AttributeFQN));
            return results;
        }

        private static IEnumerable<AttributeValue> SelectValuesAssigned(Attribute x)
        {
            return x.Values.Select(v =>
                {
                    v.AttributeFQN = x.Id;
                    return v;
                });
        }

        public async Task<IEnumerable<Attribute>> EditAttributes(List<Attribute> attributes)
        {
            return await _attributeMapper.PerformAction(attributes, a => _attributeWebApiClient.UpdateAttribute(a, a.AttributeFQN));
        }

        public async Task<IEnumerable<Attribute>> DeleteAttributes(List<Attribute> attributes)
        {
            return await _attributeMapper.PerformVoidAction(attributes, a => _attributeWebApiClient.DeleteAttribute(a.AttributeFQN));
        }
    }
}