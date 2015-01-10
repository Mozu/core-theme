using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product.Attribute;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    using Mozu.ProductAdmin.Contracts.Clients;
    using Contracts = ProductAdmin.Contracts;

    public class AttributeHelper : IAttributeHelper
    {
        private readonly IAttributeWebApiClient _attributeWebApiClient;
        private readonly CollectionTaskUnMapper<Attribute, Contracts.Attribute> _attributeMapper = new CollectionTaskUnMapper<Attribute, Contracts.Attribute>();
        private readonly CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue> _attributeValueMapper = new CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue>();

        public AttributeHelper(IAttributeWebApiClient attributeWebApiClient)
        {
            _attributeWebApiClient = attributeWebApiClient;
        }

        public async Task<Attribute> GetAttribute(string attributeFQN)
        {
            var result = await _attributeWebApiClient.GetAttribute(attributeFQN).ConfigureAwait(false);
            var res = result.ReadAsAsync().Result;

            return Mapper.Map<Attribute>(res);
        }

        public async Task<IEnumerable<Attribute>> GetAttributes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            string filter = extFilter.ToFilterString();
            string sort = null;   // pagingParams.sort.ToSortString();

            var result = await _attributeWebApiClient.GetAttributes(
                /* startIndex:     */ pagingParams.startIndex,
                /* pageSize:       */ pagingParams.pageSize,
                /* sortBy:         */ sort,
                /* filter:         */ filter,
                /* responseGroups: */ null
                ).ConfigureAwait(false);
            var res = result.ReadAsAsync().Result;

            return res.Items.Select(Mapper.Map<Attribute>);
        }

        public  Task<IEnumerable<Attribute>> CreateAttributes(List<Attribute> attributes)
        {
            
            return _attributeMapper.PerformAction(attributes, a =>
                {
                    a.AttributeCode = Regex.Replace(a.AttributeCode, "[^A-Za-z0-9-_\\.]", "-");  
                    return _attributeWebApiClient.AddAttribute(a);
                });
            //await _attributeValueMapper.PerformAction(results.SelectMany(SelectValuesAssigned), (a, b) => _attributeWebApiClient.AddAttributeVocabularyValue(a, b.AttributeFQN));
            //return results;
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
            return await _attributeMapper.PerformAction(attributes, a => _attributeWebApiClient.UpdateAttribute(a, a.AttributeFQN)).ConfigureAwait(false);
        }

        public async Task<IEnumerable<Attribute>> DeleteAttributes(List<Attribute> attributes)
        {
            return await _attributeMapper.PerformVoidAction(attributes, a => _attributeWebApiClient.DeleteAttribute(a.AttributeFQN)).ConfigureAwait(false);
        }
    }
}