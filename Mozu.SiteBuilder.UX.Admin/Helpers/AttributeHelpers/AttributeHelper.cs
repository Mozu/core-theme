using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
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
        private readonly IProductWebApiClient _productWebApiClient;
        private readonly CollectionTaskUnMapper<Attribute, Contracts.Attribute> _attributeMapper = new CollectionTaskUnMapper<Attribute, Contracts.Attribute>();
        private readonly CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue> _attributeValueMapper = new CollectionTaskUnMapper<AttributeValue, Contracts.AttributeVocabularyValue>();

        public AttributeHelper(IAttributeWebApiClient attributeWebApiClient, IProductWebApiClient productWebApiClient)
        {
            _attributeWebApiClient = attributeWebApiClient;
            _productWebApiClient = productWebApiClient;
        }

        public async Task<Attribute> GetAttribute(string attributeFQN)
        {
            var attribute = (await _attributeWebApiClient.GetAttribute(attributeFQN)).ReadAsSync();
            var returnAttribute = Mapper.Map<Attribute>(attribute);

            return returnAttribute;
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
            await DeleteContentForResetOverrides(attributes);   
            RemoveValueForProductCodeWithNoNameOverride(attributes);
            return await _attributeMapper.PerformAction(attributes, a => _attributeWebApiClient.UpdateAttribute(a, a.AttributeFQN)).ConfigureAwait(false);
        }

        /// <summary>
        /// Required to remove Content node as update will not delete once overriden.
        /// </summary>
        /// <param name="attributes"></param>
        /// <returns></returns>
        private async Task DeleteContentForResetOverrides(List<Attribute> attributes)
        {
            var resetItems = new List<Task<ServiceClientResponse<StreamContent>>>();
            foreach (var items in attributes.Where(x => x.DataType == AttributeDataType.ProductCode)
                .Select(attr => attr.Values.Where(a => a.IsOverriden && a.Value.Equals(a.OptionalValue))
                .Select(
                    val =>
                        _attributeWebApiClient.DeleteAttributeVocabularyValueLocalizedContent(attr.Id,
                            val.Id as string, val.LocaleCode))))
            {
                resetItems.AddRange(items);
            }
            await Task.WhenAll(resetItems);
        }

        private static void RemoveValueForProductCodeWithNoNameOverride(List<Attribute> attributes)
        {
            foreach (var val in attributes.Where(x => x.DataType == AttributeDataType.ProductCode)
                .SelectMany(attr => attr.Values.Where(a => a.Value.Equals(a.OptionalValue))))
            {
                val.Value = null;
            }
        }

        public async Task<IEnumerable<Attribute>> DeleteAttributes(List<Attribute> attributes)
        {
            return await _attributeMapper.PerformVoidAction(attributes, a => _attributeWebApiClient.DeleteAttribute(a.AttributeFQN)).ConfigureAwait(false);
        }
    }
}