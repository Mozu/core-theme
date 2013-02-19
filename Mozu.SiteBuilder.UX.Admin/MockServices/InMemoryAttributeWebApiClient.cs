using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using System.Collections.Concurrent;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    using ProductAdmin.Contracts;

    public interface IMoreAwesomeAttributeWebApiClient : IAttributeWebApiClient
    {
    }

    public class InMemoryAttributeWebApiClient : IMoreAwesomeAttributeWebApiClient
    {
        private readonly IDictionary<string, AttributeTypeRule> _attributeTypeRules;
        private readonly IDictionary<string, Attribute> _attributes;
        private readonly IDictionary<string, List<AttributeVocabularyValue>> _attributeVocabularyValues;

        public InMemoryAttributeWebApiClient()
        {
            _attributeTypeRules = new ConcurrentDictionary<string, AttributeTypeRule>();
            _attributes = new ConcurrentDictionary<string, Attribute>();
            _attributeVocabularyValues = new ConcurrentDictionary<string, List<AttributeVocabularyValue>>();
        }

        public ConfigOptions Options { get; set; }

        public IServiceClientMessageHandler Handler { get; set; }

        public Task<ServiceClientResponse<AttributeTypeRuleCollection>> GetAttributeTypeRules(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            return TaskCollection<AttributeTypeRule, AttributeTypeRuleCollection>(_attributeTypeRules.Values);
        }

        public Task<ServiceClientResponse<AttributeCollection>> GetAttributes(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            return TaskCollection<Attribute, AttributeCollection>(_attributes.Values);
        }

        public Task<ServiceClientResponse<Attribute>> GetAttribute(string attributeFQN, string responseGroups = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            Attribute attribute;
            return Task(_attributes.TryGetValue(attributeFQN, out attribute) ? attribute : default(Attribute));
        }

        public Task<ServiceClientResponse<AttributeVocabularyValueCollection>> GetAttributeVocabularyValues(string attributeFQN, string responseGroups = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            return TaskCollection<AttributeVocabularyValue, AttributeVocabularyValueCollection>(_attributeVocabularyValues.SelectMany(x => x.Value));
        }

        public Task<ServiceClientResponse<Attribute>> AddAttribute(Attribute attribute, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            _attributes.Add(attribute.AttributeFQN, attribute);
            return Task(attribute);
        }

        public Task<ServiceClientResponse<AttributeVocabularyValue>> AddAttributeVocabularyValue(AttributeVocabularyValue attributeValue, string attributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            List<AttributeVocabularyValue> list;
            if (_attributeVocabularyValues.TryGetValue(attributeFQN, out list))
            {
                list.Add(attributeValue);
            }
            else
            {
                _attributeVocabularyValues.Add(attributeFQN, new List<AttributeVocabularyValue> { attributeValue });
            }
            return Task(attributeValue);
        }

        public Task<ServiceClientResponse<Attribute>> UpdateAttribute(Attribute attribute, string atributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            _attributes[atributeFQN] = attribute;
            return Task(attribute);
        }

        public Task<ServiceClientResponse<List<AttributeVocabularyValue>>> UpdateAttributeVocabularyValues(List<AttributeVocabularyValue> attributeValue, string attributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            if (_attributeVocabularyValues.ContainsKey(attributeFQN))
            {
                _attributeVocabularyValues[attributeFQN] = attributeValue;
            }
            else
            {
                _attributeVocabularyValues.Add(attributeFQN, attributeValue);
            }
            return Task(attributeValue);
        }

        public Task<ServiceClientResponse<AttributeVocabularyValue>> UpdateAttributeVocabularyValue(AttributeVocabularyValue attributeValue, string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            var updatedAttribute = attributeValue;
            updatedAttribute.Value = value;

            List<AttributeVocabularyValue> list;
            if (_attributeVocabularyValues.TryGetValue(attributeFQN, out list))
            {
                var index = list.FindIndex(x => x.Value == attributeValue.Value);
                list.RemoveAt(index);
                list.Insert(index, updatedAttribute);
            }
            else
            {
                return AddAttributeVocabularyValue(attributeValue, attributeFQN, targetContextLevel);
            }
            return Task(attributeValue);
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteAttribute(string AttributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            _attributes.Remove(AttributeFQN);
            return Task(default(StreamContent));
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteAttributeValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
        {
            List<AttributeVocabularyValue> list;
            if (_attributeVocabularyValues.TryGetValue(attributeFQN, out list))
            {
                list.RemoveAll(x => x.Value == value);
                list.RemoveAll(x => x.Content.StringValue == value);
            }
            return Task(default(StreamContent));
        }

        private static Task<ServiceClientResponse<T>> Task<T>(T entity)
        {
            return (new TestResponse<T>(entity)).Task;
        }

        private static Task<ServiceClientResponse<TCollection>> TaskCollection<T, TCollection>(IEnumerable<T> entityList)
            where TCollection : CollectionBase<T>, new()
        {
            return Task(new TCollection { Items = entityList.ToList() });
        }
    }
}