using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using Category = Mozu.SiteBuilder.UX.Admin.Api.Models.Category.Category;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/category", SuppressDescriptorGeneration = true)]
    public class CategoryController : BaseController
    {
        private readonly ICategoryWebApiClient  _categoriesClient;

        public CategoryController(ICategoryWebApiClient categoriesClient)
        {

            _categoriesClient = categoriesClient.CloneWithApiContext(x => x.SiteId = null);

        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<Category>>> GetCategories([FromUri]PagingParamaters pagingParams, [FromUri] FilterCollection filterCollection, int? nodeQuery= null, int? id=null)
        {
            if (id.HasValue)
            {
                var cat = (await _categoriesClient.GetCategory(id)).ReadAsSync();
                var retList = new List<Category> {Mapper.Map<Category>(cat)};
                return List2(retList);
               

            }
            //getting rid of server filtering for now.  all filtering done on the client.
            //if (pagingParams.id == null || 1==1)
            {
                int start = 0;
                //var ctxLevel = TargetContextLevelType.MasterCatalog;
                
                //int siteId = -1;
                //ICategoryWebApiClient catClient = _categoriesClient;
                //if (nodeQuery.HasValue && filterCollection.TryGetValue("SiteId", out siteId))
                //{
                //    ctxLevel = TargetContextLevelType.Site;
                //    catClient = _categoriesClient.CloneWith(x => x.SiteId = siteId);

                //}
                List<Category> categories = new List<Category>();
                var client = _categoriesClient.CloneWithApiContext(x =>
                {
                    x.CatalogId = null;
                    x.SiteId = null;
                });
                while (true)
                {
                    var cats = (await client.GetCategories(startIndex: start, pageSize: 600, sortBy:"sequence asc")).ReadAsSync();
                    categories.AddRange(Mapper.Map<List<Category>>(cats.Items));
                    start = cats.PageSize + cats.StartIndex;
                    if (cats.TotalCount <= start )
                    {
                        break;
                    }
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

            // var category = (await _categoriesClient.GetCategory(pagingParams.NumericId)).ReadAsSync();
            // 
            // return List2(Mapper.Map<Category>(category));
        }

        [HttpGetRoute(UriTemplate = "autocomplete/?query={query}&value={categoryIdsString}")]
        public async Task<Response<List<AutoCompleteField<int>>>> SearchByName(string query, FilterCollection extFilter, string categoryIdsString)
        {
            var allCategories = (await _categoriesClient.GetCategories(0, 600, null, null, null)).ReadAsSync().Items
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

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Category>>> UpdateCategory(List<Category> categories)
        {
            var tasks = new List<Task<ServiceClientResponse<DC.Category>>>();

            foreach (var cat in categories)
            {
                var dcCat = Mapper.Map<DC.Category>(cat);
                var task = _categoriesClient.UpdateCategory(dcCat, cat.Id, false);
                tasks.Add(task);
            }

            await Task.WhenAll(tasks);
            var returnList = tasks.Select(t => Mapper.Map<Category>(t.Result.ReadAsSync())).ToList();

            return List2(returnList);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Category>>> CreateCategory(List<Category> categories)
        {
            var tasks =categories.Select(category => _categoriesClient.AddCategory(Mapper.Map<DC.Category>(category))).ToList();
            await Task.WhenAll(tasks);

            var ret = tasks.Select(res => (Mapper.Map<Category>(res.Result.ReadAsSync()))).ToList();
            
            return List2( ret);
        }

        [HttpPostRoute(UriTemplate = "delete/?force={force}")]
        public async Task<Response<List<Category>>> DeleteCategory(List<Category> categories, [FromUri]bool force = true)
        {
            var tasks = categories.Select(category => _categoriesClient.DeleteCategoryById(category.Id, category.CascadeDelete, forceDelete: force, reassignToParent: !category.CascadeDelete)).ToList();
            await Task.WhenAll(tasks);
            AnyExceptionsThenThrow(tasks);

            return EmptyList2<Category>();
        }

        [HttpPostRoute(UriTemplate = "duplicate/?id={id}")]
        public async Task<Response<Category>> DuplicateCategory(int id)
        {
            var originalCategory = _categoriesClient.GetCategory(id).Result.ReadAsAsync().Result;
            originalCategory.Id = -1;
            //originalCategory.Content.CategoryId = -1;
            //originalCategory.CategoryCode += "-COPY";
            originalCategory.Content.Name += "-COPY";

            var newCategory = (await _categoriesClient.AddCategory(originalCategory)).ReadAsSync();

            return Single2(Mapper.Map<Category>(newCategory));
        }
        
        [HttpPostRoute(UriTemplate = "validateexpression")]
        public async Task<Response<DynamicExpression>> ValidateDynamicExpression(DynamicExpression expression)
        {
            var validatedExpresssion = _categoriesClient.ValidateDynamicExpression(expression).Result.ReadAsAsync().Result;
            return Single2(validatedExpresssion);
        }

    }
}
