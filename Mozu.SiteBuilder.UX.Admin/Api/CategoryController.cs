using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using MoreLinq;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers;
using Category = Mozu.SiteBuilder.UX.Admin.Api.Models.Category.Category;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Misc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/category", SuppressDescriptorGeneration = true)]
    public class CategoryController : BaseController
    {
        private readonly ICategoryHelper _categoryHelper;
        private readonly ICategoryWebApiClient  _categoriesClient;
        private const string _listResponseFields = "items(id,categoryCode,isDisplayed,isActive,sequence,childCount,parentCategoryId,parentCategoryCode,parentCategoryName,catalogId,categoryType,content(name,slug,metaTagDescription,metaTagTitle,metaTagKeywords),auditInfo)";
        AdminCache _adminCache;
        public CategoryController(ICategoryWebApiClient categoriesClient, ICategoryHelper categoryHelper, AdminCache adminCache)
        {
            _categoryHelper = categoryHelper;

            _categoriesClient = categoriesClient.CloneWithApiContext(x => x.SiteId = null);
            _adminCache = adminCache;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<Category>>> GetCategories([FromUri]PagingParamaters pagingParams, [FromUri] FilterCollection filterCollection, int? nodeQuery= null, int? id=null, bool? isActive=null)
        {
            if (id.HasValue && id != 666)
            {
                return await GetSingleCategory(id);
            }
            //getting rid of server filtering for now.  all filtering done on the client.
            
            int start = 0;
            var ctxLevel = TargetContextLevelType.MasterCatalog;

            int siteId = -1;
            ICategoryWebApiClient catClient = _categoriesClient;
            if (nodeQuery.HasValue && filterCollection.TryGetValue("SiteId", out siteId))
            {
                ctxLevel = TargetContextLevelType.Site;
                catClient = _categoriesClient.CloneWithApiContext(x => x.SiteId = siteId);

            }
           
            var client = _categoriesClient.CloneWithApiContext(x =>
            {
                x.CatalogId = null;
                x.SiteId = null;
            });
            var extFilter = filterCollection.ToFilterString();

            if (isActive.HasValue && !(filterCollection.Any(x => x.property == "status")))
            {
                extFilter = AppendIsActiveDefault(isActive, extFilter);
            }


            var key = $"category-{extFilter}-{_listResponseFields}-{SbApiContext.CatalogId}";
            var categories = _adminCache.Get(SbApiContext.TenantId, key) as List<Category>;
            if (categories == null)
            {
                categories = new List<Category>();

                while (true)
                {
                    var cats = (await client.GetCategories(startIndex: start,
                        pageSize: 60000, //current API maximum is 200 - May 2016
                        sortBy: "sequence asc",
                        filter: extFilter,
                        responseFields: _listResponseFields
                        )).ReadAsSync();
                    categories.AddRange(Mapper.Map<List<Category>>(cats.Items));
                    start = cats.PageSize + cats.StartIndex;
                    if (cats.TotalCount <= start)
                    {
                        break;
                    }
                }
                AdminCache.Instace.Add(SbApiContext.TenantId, key, categories);
            }
            foreach (var category1 in categories)
            {
                if (category1.ParentId.GetValueOrDefault(-1) > -1)
                {
                    category1.Parent = categories.FirstOrDefault(x => x.Id == category1.ParentId.Value);
                }
            }
            var ancestory = new List<Category>();
            foreach (var category1 in categories.Where(x => x.Parent != null))
            {
                ancestory.Clear();
                var parent = category1.Parent;

                do
                {
                    if (ancestory.Contains(parent))
                    {
                        break;
                    }
                    ancestory.Add(parent);
                    parent = parent.Parent;

                } while (parent != null);
                ancestory.Reverse();
                category1.Path = string.Join("/", ancestory.Select(x => x.Id).ToArray());

            }
            return List2(categories);
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Category>>> GetCategoryList([FromUri]PagingParamaters pagingParams, [FromUri] FilterCollection filterCollection, [FromUri] bool isPicker = false)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                return await GetSingleCategory(pagingParams.NumericId);
            }
            var sort = pagingParams.sort.ToSortString();
            if (string.IsNullOrEmpty(sort))
            {
                sort = "sequence asc";
            }

            var filter = filterCollection.ToFilterString();

            // have to look at collection in case "all" is passed.
            if (!(filterCollection.Any(x => x.property == "status")))
            {
                filter = AppendIsActiveDefault(true, filter);
            }

            var responseFields = (isPicker)
                ? "items(id, categoryCode, childCount, isActive, content(name)"
                : _listResponseFields;
            //getting rid of server filtering for now.  all filtering done on the client.
            var cats = (await _categoriesClient.GetCategories(startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sort,
                filter: filter,
                responseFields: responseFields
                )).ReadAsSync();
            return List2(Mapper.Map<List<Category>>(cats.Items), cats.TotalCount);
        }

        private async Task<Response<List<Category>>> GetSingleCategory(int? id)
        {
            var cat = (await _categoriesClient.GetCategory(id)).ReadAsSync();
            var retList = new List<Category> { Mapper.Map<Category>(cat) };
            return List2(retList, total:1);
        }

        private static string AppendIsActiveDefault(bool? isActive, string extFilter)
        {
            return string.IsNullOrEmpty(extFilter) 
                ?  $"isactive eq \"{isActive}\""
                : $"{extFilter} and isactive eq \"{isActive}\"";
        }

        [HttpGetRoute(UriTemplate = "autocomplete/?query={query}&value={categoryIdsString}")]
        public async Task<Response<List<AutoCompleteField<int>>>> SearchByName(string query, FilterCollection extFilter, string categoryIdsString)
        {
            var allCategories = (await _categoriesClient.GetCategories(0, 200, null, null, null)).ReadAsSync().Items
                    //.Where(x => x.IsSystemDefault == false && x.Content != null && x.Content.Name != null)
                    .OrderBy(f => f.Content.Name);
            var catDic = allCategories.ToDictionary(x => x.Id);

            List<DC.Category> categories = null;
            int catId;
            if (extFilter != null && extFilter.TryGetValue <int>( "id", out catId ))
            {
                categories = new List<DC.Category>() { catDic[catId ] };
            }
            else if (!string.IsNullOrEmpty(categoryIdsString))
            {
                int[] catIds = categoryIdsString.Split(new char[] { ',', ' ' }, System.StringSplitOptions.RemoveEmptyEntries).Select(x => int.Parse(x)).ToArray();

                categories = allCategories.Where(x => catIds.Contains(x.Id.GetValueOrDefault(-1))).ToList();
            }
            else
            {
                categories = allCategories.Where(x => x.Content.Name.IndexOf(query, System.StringComparison.OrdinalIgnoreCase) > -1).ToList();
            }
           
            var retList = new List<AutoCompleteField<int>>();
            var tmpHash = new HashSet<DC.Category>();
            foreach (var category in categories)
            {
               
                tmpHash.Clear();
                var parentCat = category;
                tmpHash.Clear();
                tmpHash.Add(category);
                while (parentCat.ParentCategoryId.HasValue )
                {
                    
                    if (catDic.TryGetValue(parentCat.ParentCategoryId.Value, out parentCat))
                    {

                        if (tmpHash.Contains(parentCat))
                        {
                            break;
                        }
                        else
                        {
                            tmpHash.Add(parentCat);
                        }
                    }
                    else
                    {
                        break;
                    }
                    
                }

                var item = new AutoCompleteField<int>()
                {
                    Display = category.Content.Name,
                    Value = category.Id.GetValueOrDefault( -1),
                    Path = string.Join ( ">",  tmpHash.Reverse ().Select ( x=> x.Content.Name ).ToArray ())
                };
                retList.Add(item);
            }
            //var fields = categories.Select(category => new AutoCompleteField<int>
            //{
            //    Display = category.Content.Name,
            //    Value = category.CategoryId,
            //}).ToList();

            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "update/category")]
        public async Task<Response<List<Category>>> UpdateCategories(List<Category> categories)
        {
            var c = _categoryHelper.GetCategorySequenceCollection(categories);
            var res = await _categoriesClient.UpdateCategoryTree(c);

            if (res.HasException)
            {
                throw new System.Exception("Error Updating Category");
            }

            var cats = res.ReadAsSync();

            return List2(Mapper.Map<List<Category>>(cats), cats?.Count);
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Category>>> UpdateCategory(List<Category> categories)
        {
            var returnList = new List<Category>();

            if (categories.Count == 1)
            {

                //single record Create/Update
                var cat = categories.First();
                var existingCategory = (await _categoriesClient.GetCategory(cat.Id)).ReadAsSync();
                var dcCat = Mapper.Map<DC.Category>(cat);

                // from sitebuilder, when saving a category we dont have the category images, so we go get them
                if (cat.CategoryImages == null && existingCategory.Content.CategoryImages != null)
                {
                    dcCat.Content.CategoryImages = existingCategory.Content.CategoryImages;
                }

                if (cat.CategoryType == "DynamicPreComputed" && cat.DynamicExpression.Tree.Nodes.Length == 0 && existingCategory != null)
                {
                    dcCat.DynamicExpression = existingCategory.DynamicExpression;
                }

                var taskResult = (await _categoriesClient.UpdateCategory(dcCat, cat.Id, false)).ReadAsAsync();
                returnList.Add(Mapper.Map<Category>(taskResult.Result));
                return List2(returnList);
            }

            // Multiple records in list assumes we only update the parent-id and sequence
            /* TODO: we really could send less data from the client when changing sequence   */

            var inputSequenceList = _categoryHelper.GetCategorySequenceCollection(categories);

            if (inputSequenceList.Items.Any())
            {
                await Task.WhenAll(_categoriesClient.UpdateCategoryTree(inputSequenceList));
            }
            return List2(categories); //NOTE: returns the same as input
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Category>>> CreateCategory(List<Category> categories)
        {
            var tasks =categories.Select(category => _categoriesClient.AddCategory(Mapper.Map<DC.Category>(category))).ToList();
            await Task.WhenAll(tasks);

            var ret = tasks.Select(res => (Mapper.Map<Category>(res.Result.ReadAsSync()))).ToList();
            
            return List2( ret);
        }

        [HttpPostRoute(UriTemplate = "delete/?cascadeDelete={cascadeDelete}")]
        public async Task<Response<List<Category>>> DeleteCategory(List<Category> categories, [FromUri]bool cascadeDelete = false)
        {
            var tasks = categories.Select(category => _categoriesClient.DeleteCategoryById(category.Id, cascadeDelete, forceDelete: true, reassignToParent: !cascadeDelete)).ToList();
            await Task.WhenAll(tasks);
            AnyExceptionsThenThrow(tasks);

            return EmptyList2<Category>();
        }

        [HttpPostRoute(UriTemplate = "duplicate/?id={id}")]
        public async Task<Response<Category>> DuplicateCategory(int id)
        {
            var originalCategory = _categoriesClient.GetCategory(id).Result.ReadAsAsync().Result;
            originalCategory.Id = -1;
            originalCategory.Content.Name += "-COPY";

            var newCategory = (await _categoriesClient.AddCategory(originalCategory)).ReadAsSync();

            return Single2(Mapper.Map<Category>(newCategory));
        }
        
        [HttpPostRoute(UriTemplate = "validateexpression")]
        public async Task<Response<Models.Category.DynamicExpression>> ValidateDynamicExpression(Models.Category.DynamicExpression expression)
        {

            
            if (expression.Type == "DynamicPreComputed")
            {

                var validatedExpression =
                    (await _categoriesClient.ValidateDynamicExpression(Mapper.Map<DC.DynamicExpression>(expression)))
                        .ReadAsSync(); //.Result.ReadAsAsync().Result;
                return Single2(Mapper.Map<Models.Category.DynamicExpression>(validatedExpression));
            }
            else
            {
                var validatedExpression =
                    (await
                        _categoriesClient.ValidateRealTimeDynamicExpression(Mapper.Map<DC.DynamicExpression>(expression)))
                        .ReadAsSync();  //.Result.ReadAsAsync().Result ;
                return Single2(Mapper.Map<Models.Category.DynamicExpression>(validatedExpression));
            }
        }

        [HttpGetRoute(UriTemplate = "node/{id}?showInactive={showInactive}&isDisplayed={isDisplayed}")]
        public async Task<Response<Models.Category.CategoryNode>> GetCategoryNode(int? id=0, bool? showInactive = null, bool? isDisplayed = null)
        {
            var cat = (await _categoriesClient.GetCategoryTreeNode(id, showInactive, isDisplayed)).ReadAsSync();
            var retList = Mapper.Map<Models.Category.CategoryNode>(cat) ;
            return Single2(retList);
        }

        [HttpPostRoute(UriTemplate = "tree-for-open-nodes?showInactive={showInactive}")]
        public async Task<Response<Models.Category.CategoryNode>> GetPartialCategoryTreeForOpenNodes(List<int> parentIds, [FromUri]bool? showInactive = null)
        {
            var tree = (await _categoriesClient.GetCategoryTreeFromNodes(parentIds, showInactive)).ReadAsSync();
            var retVal = Mapper.Map<Models.Category.CategoryNode>(tree);
            return Single2(retVal);
        }
    }
}
