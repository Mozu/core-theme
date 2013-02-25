using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.MockServices.Mocks;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    public interface IMoreAwesomeProductTypeWebApiClient : IProductTypeWebApiClient
    {
        bool IsAwesome { get; }
    }

    /// <summary>
    /// Mocks IProductTypeWebApiClient to store ProductTypes in the HttpRuntime.Cache
    /// </summary>
    public class InMemoryProductTypeWebApiClient : AbstractInMemoryResourceApiClient<List<DC.ProductType>>, IMoreAwesomeProductTypeWebApiClient
    {
        private const string PRODUCT_TYPE_CACHE_FORMAT_STRING = "_product_types_{0}_{1}";
        private IApiContext _ctx;

        /// <summary>
        /// Cache key for the repository. Tied to current tenant/site group.
        /// </summary>
        protected override string CacheKey { get { return String.Format(PRODUCT_TYPE_CACHE_FORMAT_STRING, _ctx.TenantId, _ctx.SiteGroupId); } }

        /// <summary>
        /// Implements IMoreAwesomeProductTypeWebApiClient
        /// </summary>
        public bool IsAwesome { get { return true; } }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public InMemoryProductTypeWebApiClient(IApiContext ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Get single.
        /// </summary>
        public Task<ServiceClientResponse<DC.ProductType>> GetProductType(int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            DC.ProductType prod;
            lock (Repository)
            {
                prod = Repository.FirstOrDefault(p => p.Id == productTypeId);
            }

            return (new TestResponse<DC.ProductType>(prod)).Task;
        }

        /// <summary>
        /// Get list.
        /// </summary>
        public Task<ServiceClientResponse<DC.ProductTypeCollection>> GetProductTypes(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            var items = Repository.ToList();

            // ignore all paging and sorting parameters, because fuck it.
            DC.ProductTypeCollection returnCol = new DC.ProductTypeCollection { Items = items, TotalCount = items.Count };

            return (new TestResponse<DC.ProductTypeCollection>(returnCol)).Task;
        }

        /// <summary>
        /// Add ProductType.
        /// </summary>
        public Task<ServiceClientResponse<DC.ProductType>> AddProductType(DC.ProductType productType, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            lock (Repository)
            {
                int maxId = Repository.Select(pt => (int)pt.Id).Max();
                productType.Id = maxId + 1;
                Repository.Add(productType);
            }

            return (new TestResponse<DC.ProductType>(productType)).Task;
        }

        /// <summary>
        /// Edit ProductType.
        /// </summary>
        public Task<ServiceClientResponse<DC.ProductType>> UpdateProductType(DC.ProductType productType, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            lock (Repository)
            {
                int indexOfExisting = Repository.FindIndex(pt => pt.Id == productTypeId);
                Repository[indexOfExisting] = productType;
            }

            return (new TestResponse<DC.ProductType>(productType)).Task;
        }

        /// <summary>
        /// Delete a ProductType.
        /// </summary>
        public Task<ServiceClientResponse<StreamContent>> DeleteProductType(int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            lock (Repository)
            {
                Repository.RemoveAll(pt => pt.Id == productTypeId);
            }

            return (new TestResponse<StreamContent>(null)).Task;
        }

        /// <summary>
        /// Initializes some mock product data for the ui team's delight.
        /// </summary>
        protected override void InitializeRepoWithMockData(List<DC.ProductType> repo)
        {
            DC.ProductType p1 = new DC.ProductType
            {
                Id = 1,
                Name = "Product Type 1",
                Properties = new List<DC.AttributeInProductType>
                {
                    new DC.AttributeInProductType {
                        Attribute = new ColorAttribute(),
                        AttributeFQN = ColorAttribute.ATTRIBUTE_FQN
                    }
                },
                Options = new List<DC.AttributeInProductType>
                {
                    new DC.AttributeInProductType {
                        Attribute = new GiftWrapAttribute(),
                        AttributeFQN = GiftWrapAttribute.ATTRIBUTE_FQN
                    }
                },
                Extras = new List<DC.AttributeInProductType>
                {
                    new DC.AttributeInProductType {
                        Attribute = new EngravingAttribute(),
                        AttributeFQN = EngravingAttribute.ATTRIBUTE_FQN
                    }
                }
            };

            DC.ProductType p2 = new DC.ProductType
            {
                Id = 2,
                Name = "Product Type 2",
                Properties = new List<DC.AttributeInProductType>(),
                Options = new List<DC.AttributeInProductType>(),
                Extras = new List<DC.AttributeInProductType>()
            };

            DC.Attribute p3attribute = new EngravingAttribute();
            p3attribute.VocabularyValues.Add(new DC.AttributeVocabularyValue { Value = "YOLO" });

            DC.ProductType p3 = new DC.ProductType
            {
                Id = 3,
                Name = "Product Type 3",
                Properties = new List<DC.AttributeInProductType>(),
                Options = new List<DC.AttributeInProductType>(),
                Extras = new List<DC.AttributeInProductType>
                {
                    new DC.AttributeInProductType {
                        Attribute = p3attribute,
                        AttributeFQN = p3attribute.AttributeFQN,
                        VocabularyValues = new List<DC.AttributeVocabularyValueInProductType> {
                            new DC.AttributeVocabularyValueInProductType {
                                Order = 1,
                                Value = p3attribute.VocabularyValues.First().Value,
                                VocabularyValue = p3attribute.VocabularyValues.First()
                            }
                        }
                    }
                }
            };
            repo.AddRange(new[] { p1, p2, p3 });
        }

        #region IProductTypeWebApiClient shit that i'm not implementing
        public Task<ServiceClientResponse<DC.AttributeInProductType>> AddExtra(DC.AttributeInProductType attributeInProductType, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeVocabularyValueInProductType>> AddExtraVocabularyValue(DC.AttributeVocabularyValueInProductType attributeInProductTypeValue, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> AddOption(DC.AttributeInProductType attributeInProductType, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeVocabularyValueInProductType>> AddOptionVocabularyValue(DC.AttributeVocabularyValueInProductType attributeInProductTypeValue, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> AddProperty(DC.AttributeInProductType attributeInProductType, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeVocabularyValueInProductType>> AddPropertyVocabularyValue(DC.AttributeVocabularyValueInProductType attributeInProductTypeValue, int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteExtra(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteExtraVocabularyValue(int? productTypeId, string attributeFQN, string value, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteOption(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteOptionVocabularyValue(int? productTypeId, string attributeFQN, string value, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteProperty(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeletePropertyVocabularyValue(int? productTypeId, string attributeFQN, string value, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> GetExtra(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeInProductType>>> GetExtras(int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> GetExtrasVocabularyValues(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> GetOption(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeInProductType>>> GetOptions(int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> GetOptionsVocabularyValues(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeInProductType>>> GetProperties(int? productTypeId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> GetPropertiesVocabularyValues(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> GetProperty(int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> UpdateExtra(DC.AttributeInProductType attributeInProductType, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> UpdateExtraVocabularyValues(List<DC.AttributeVocabularyValueInProductType> vocabularyValueList, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> UpdateOption(DC.AttributeInProductType attributeInProductType, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> UpdateOptionVocabularyValues(List<DC.AttributeVocabularyValueInProductType> vocabularyValueList, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.AttributeInProductType>> UpdateProperty(DC.AttributeInProductType attributeInProductType, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.AttributeVocabularyValueInProductType>>> UpdatePropertyVocabularyValues(List<DC.AttributeVocabularyValueInProductType> vocabularyValueList, int? productTypeId, string attributeFQN, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public IServiceClientMessageHandler Handler
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public ConfigOptions Options
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }
        #endregion
    }
}