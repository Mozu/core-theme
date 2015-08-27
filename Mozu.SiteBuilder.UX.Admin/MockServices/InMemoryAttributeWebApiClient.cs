using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.Caching;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    //public interface IMoreAwesomeAttributeWebApiClient : IAttributeWebApiClient
    //{
    //}

    public class AttributeRepo
    {
        public readonly List<DC.Attribute> Attributes = new List<DC.Attribute>();
        public readonly List<DC.AttributeTypeRule> AttributeTypeRules = new List<DC.AttributeTypeRule>();
        public readonly ConcurrentDictionary<string, List<DC.AttributeVocabularyValue>> AttributeVocabularyValues = new ConcurrentDictionary<string, List<DC.AttributeVocabularyValue>>();
    }

//    public class InMemoryAttributeWebApiClient : AbstractInMemoryResourceApiClient<AttributeRepo>, IMoreAwesomeAttributeWebApiClient
//    {
//        private const string CACHE_KEY_FORMAT_STRING = "_product_attributes_{0}_{1}";
//        private IApiContext _ctx;

//        /// <summary>
//        /// Cache key for the repository. Tied to current tenant/site group.
//        /// </summary>
//        protected override string CacheKey { get { return String.Format(CACHE_KEY_FORMAT_STRING, _ctx.TenantId, _ctx.MasterCatalogId); } }

//        /// <summary>
//        /// Public constructor
//        /// </summary>
//        /// <param name="ctx"></param>
//        public InMemoryAttributeWebApiClient(IApiContext ctx, ObjectCache cache = null) : base(cache)
//        {
//            _ctx = ctx;
//        }

//        public ConfigOptions Options { get; set; }

//        public IServiceClientMessageHandler Handler { get; set; }

//        protected override void InitializeRepoWithMockData(AttributeRepo repo)
//        {
//            foreach (var item in SeedAttributes)
//            {
//                repo.Attributes.Add(item);
//                foreach (var attribute in repo.Attributes)
//                {
//                    repo.AttributeVocabularyValues.AddOrUpdate(
//                        attribute.AttributeFQN,
//                        attribute.VocabularyValues,
//                        (s, list) => repo.AttributeVocabularyValues[s]
//                        );
//                }
//            }
//        }

//        public Task<ServiceClientResponse<DC.AttributeTypeRuleCollection>> GetAttributeTypeRules(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            return TaskCollection<DC.AttributeTypeRule, DC.AttributeTypeRuleCollection>(Repository.AttributeTypeRules);
//        }

//        public Task<ServiceClientResponse<DC.AttributeCollection>> GetAttributes(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            return TaskCollection<DC.Attribute, DC.AttributeCollection>(Repository.Attributes);
//        }

//        public Task<ServiceClientResponse<DC.Attribute>> GetAttribute(string attributeFQN, string responseGroups = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            return Task(Repository.Attributes.FirstOrDefault(a => a.AttributeFQN == attributeFQN));
//        }

//        public Task<ServiceClientResponse<DC.AttributeVocabularyValueCollection>> GetAttributeVocabularyValues(string attributeFQN, string responseGroups = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            var values = Repository.AttributeVocabularyValues.Where(x => x.Value != null).SelectMany(x => x.Value);
//            return TaskCollection<DC.AttributeVocabularyValue, DC.AttributeVocabularyValueCollection>(values);
//        }

//        public Task<ServiceClientResponse<DC.Attribute>> AddAttribute(DC.Attribute attribute, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            lock (Repository)
//            {
//                Repository.Attributes.Add(attribute);
//            }
//            return Task(attribute);
//        }

//        public Task<ServiceClientResponse<DC.AttributeVocabularyValue>> AddAttributeVocabularyValue(DC.AttributeVocabularyValue attributeValue, string attributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            List<DC.AttributeVocabularyValue> list = Repository.AttributeVocabularyValues.GetOrAdd(attributeFQN, new List<DC.AttributeVocabularyValue>());
//            list.Add(attributeValue);

//            return Task(attributeValue);
//        }

//        public Task<ServiceClientResponse<DC.Attribute>> UpdateAttribute(DC.Attribute attribute, string atributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            int index = Repository.Attributes.FindIndex(a => a.AttributeFQN == atributeFQN);
//            Repository.Attributes[index] = attribute;

//            return Task(attribute);
//        }

//        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValue>>> UpdateAttributeVocabularyValues(List<DC.AttributeVocabularyValue> attributeValue, string attributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            if (Repository.AttributeVocabularyValues.ContainsKey(attributeFQN))
//            {
//                Repository.AttributeVocabularyValues[attributeFQN] = attributeValue;
//            }
//            else
//            {
//                Repository.AttributeVocabularyValues.TryAdd(attributeFQN, attributeValue);
//            }
//            return Task(attributeValue);
//        }

//        public Task<ServiceClientResponse<DC.AttributeVocabularyValue>> UpdateAttributeVocabularyValue(DC.AttributeVocabularyValue attributeValue, string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            var updatedAttribute = attributeValue;
//            updatedAttribute.Value = value;

//            List<DC.AttributeVocabularyValue> list;
//            if (Repository.AttributeVocabularyValues.TryGetValue(attributeFQN, out list))
//            {
//                var index = list.FindIndex(x => x.Value == attributeValue.Value);
//                list.RemoveAt(index);
//                list.Insert(index, updatedAttribute);
//            }
//            else
//            {
//                return AddAttributeVocabularyValue(attributeValue, attributeFQN, targetContextLevel);
//            }
//            return Task(attributeValue);
//        }

//        public Task<ServiceClientResponse<StreamContent>> DeleteAttribute(string attributeFQN, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            Repository.Attributes.RemoveAll(a => a.AttributeFQN == attributeFQN);
            
//            List<DC.AttributeVocabularyValue> nil;
//            Repository.AttributeVocabularyValues.TryRemove(attributeFQN, out nil);

//            return Task(default(StreamContent));
//        }

//        public Task<ServiceClientResponse<StreamContent>> DeleteAttributeValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            List<DC.AttributeVocabularyValue> list;
//            if (Repository.AttributeVocabularyValues.TryGetValue(attributeFQN, out list))
//            {
//                list.RemoveAll(x => (string)x.Value == value);
//                list.RemoveAll(x => x.Content.StringValue == value);
//            }
//            return Task(default(StreamContent));
//        }

//        private static Task<ServiceClientResponse<T>> Task<T>(T entity)
//        {
//            return (new TestResponse<T>(entity)).Task;
//        }

//        private static Task<ServiceClientResponse<TCollection>> TaskCollection<T, TCollection>(IEnumerable<T> entityList)
//            where TCollection : CollectionBase<T>, new()
//        {
//            return Task(new TCollection { Items = entityList.ToList() });
//        }

//        private IEnumerable<DC.Attribute> SeedAttributes
//        {
//            get
//            {
//                return from type in GetType().Assembly.GetTypes()
//                       where typeof (DC.Attribute).IsAssignableFrom(type) && !type.IsAbstract
//                       select (DC.Attribute) Activator.CreateInstance(type);
//            }
//        }



//        public Task<ServiceClientResponse<StreamContent>> DeleteAttributeVocabularyValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<ServiceClientResponse<DC.AttributeTypeRuleCollection>> GetAttributeTypeRules(int? startIndex = null, int? pageSize = null, string sortBy = null, string filter = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            throw new NotImplementedException();
//        }

//#pragma warning disable 1066
//        public Task<ServiceClientResponse<DC.AttributeVocabularyValue>> GetAttributeVocabularyValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<List<DC.AttributeVocabularyValue>>> IAttributeWebApiClient.GetAttributeVocabularyValues(string attributeFQN, string responseGroups = null, TargetContextLevelType targetContextLevel = TargetContextLevelType.NotSpecified)
//        {
//            throw new NotImplementedException();
//        }
//#pragma warning restore 1066

//        Task<ServiceClientResponse<DC.Attribute>> IAttributeWebApiClient.AddAttribute(DC.Attribute attribute, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.AttributeVocabularyValue>> IAttributeWebApiClient.AddAttributeVocabularyValue(DC.AttributeVocabularyValue attributeVocabularyValue, string attributeFQN, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<StreamContent>> IAttributeWebApiClient.DeleteAttribute(string attributeFQN, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<StreamContent>> IAttributeWebApiClient.DeleteAttributeVocabularyValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.Attribute>> IAttributeWebApiClient.GetAttribute(string attributeFQN, string responseGroups, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.AttributeTypeRuleCollection>> IAttributeWebApiClient.GetAttributeTypeRules(int? startIndex, int? pageSize, string sortBy, string filter, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.AttributeVocabularyValue>> IAttributeWebApiClient.GetAttributeVocabularyValue(string attributeFQN, string value, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.AttributeCollection>> IAttributeWebApiClient.GetAttributes(int? startIndex, int? pageSize, string sortBy, string filter, string responseGroups, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<Core.Extensible.Contracts.Namespace>> IAttributeWebApiClient.RegisterNamespace(Core.Extensible.Contracts.Namespace name, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.Attribute>> IAttributeWebApiClient.UpdateAttribute(DC.Attribute attribute, string attributeFQN, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<DC.AttributeVocabularyValue>> IAttributeWebApiClient.UpdateAttributeVocabularyValue(DC.AttributeVocabularyValue attributeVocabularyValue, string attributeFQN, string value, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        Task<ServiceClientResponse<List<DC.AttributeVocabularyValue>>> IAttributeWebApiClient.UpdateAttributeVocabularyValues(List<DC.AttributeVocabularyValue> vocabularyValues, string attributeFQN, TargetContextLevelType targetContextLevel)
//        {
//            throw new NotImplementedException();
//        }

//        IServiceClientMessageHandler IServiceClientBase<IAttributeWebApiClient>.Handler
//        {
//            get
//            {
//                throw new NotImplementedException();
//            }
//            set
//            {
//                throw new NotImplementedException();
//            }
//        }

//        ConfigOptions IServiceClientBase<IAttributeWebApiClient>.Options
//        {
//            get
//            {
//                throw new NotImplementedException();
//            }
//            set
//            {
//                throw new NotImplementedException();
//            }
//        }
//    }
}