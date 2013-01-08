using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
//using Volusion.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using Contracts = Mozu.ProductAdmin.Contracts;
using System.Linq;

using Category = Mozu.SiteBuilder.UX.Admin.Api.Models.Category.Category;
using System.Net.Http;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class CategoryController : BaseController
    {
        private readonly ICategoryWebApiClient  _categoriesClient;

        public CategoryController(ICategoryWebApiClient categoriesClient)
        {
            
            _categoriesClient = categoriesClient;
            ((CategoryWebApiClient)_categoriesClient).Options.MaxSize = int.MaxValue;
        }

        [WebGet(UriTemplate = "/read")]
        public Task<Response<List<Category>>> GetCategories(PagingParamaters pagingParams)
        {
            if (pagingParams.id == null)
            {
                var cats = _categoriesClient.GetCategories(0, 600, null, null, null).Result.ReadAsAsync().Result;

                var categories = Mapper.Map<List<Category>>(cats.Items);

                return List(categories);
            }

            var category = _categoriesClient.GetCategory(pagingParams.NumericId ).Result.ReadAsAsync().Result;

            return List(Mapper.Map<Category>(category));
        }

        [WebGet(UriTemplate = "/autocomplete/?query={query}&value={categoryIdsString}")]
        public Task<Response<List<AutoCompleteField<int>>>> SearchByName(string query, FilterCollection extFilter, string categoryIdsString)
        {
            var allCategories = _categoriesClient.GetCategories(0, 600, null, null, null).Result.ReadAsSync().Items
                    //.Where(x => x.IsSystemDefault == false && x.Content != null && x.Content.Name != null)
                    .OrderBy(f => f.Content.Name);
            var catDic = allCategories.ToDictionary(x => x.Id);

            List<Contracts.Category > categories = null;
            int catId;
            if (extFilter != null && extFilter.TryGetValue <int>( "id", out catId ))
            {
                categories = new List<Contracts.Category>() { catDic[catId ] };
            }
            else if (!string.IsNullOrEmpty(categoryIdsString))
            {
                int[] catIds = categoryIdsString.Split(new char[] { ',', ' ' }, System.StringSplitOptions.RemoveEmptyEntries).Select(x => int.Parse(x)).ToArray();

                categories = allCategories.Where(x => catIds.Contains(x.Id)).ToList();
            }
            else
            {
                categories = allCategories.Where(x => x.Content.Name.IndexOf(query, System.StringComparison.OrdinalIgnoreCase) > -1).ToList();
            }
           
            var retList = new List<AutoCompleteField<int>>();
            var tmpHash = new HashSet<Contracts.Category>();
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
                    Value = category.Id,
                    Path = string.Join ( ">",  tmpHash.Reverse ().Select ( x=> x.Content.Name ).ToArray ())
                };
                retList.Add(item);
            }
            //var fields = categories.Select(category => new AutoCompleteField<int>
            //{
            //    Display = category.Content.Name,
            //    Value = category.CategoryId,
            //}).ToList();

            return List(retList);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/update")]
        public Task<Response<Category>> UpdateCategory(Category category)
        {
            var updatedCategory = _categoriesClient.UpdateCategory(Mapper.Map<Contracts.Category>(category), category.Id, false).Result.ReadAsAsync().Result;

            return Single(Mapper.Map<Category>(updatedCategory));
        }

        [WebInvoke(Method = "POST", UriTemplate = "/create")]
        public Task<Response<Category>> CreateCategory(Category category)
        {
            var createdCategory = _categoriesClient.AddCategory(Mapper.Map<Contracts.Category>(category)).Result.ReadAsAsync().Result;

            return Single(Mapper.Map<Category>(createdCategory));
        }

        [WebInvoke(Method = "POST", UriTemplate = "/delete/?force={force}")]
        public Task<Response<Category>> DeleteCategory(Category category, bool force)
        {
            // Always force deletion of children for now
            _categoriesClient.DeleteCategoryById(category.Id, true).Wait();
            return EmptySingle<Category>();
        }

        [WebInvoke(Method = "POST", UriTemplate = "/duplicate/?id={id}")]
        public Task<Response<Category>> DuplicateCategory(int id)
        {
            var originalCategory = _categoriesClient.GetCategory(id).Result.ReadAsAsync().Result;
            originalCategory.Id = -1;
            //originalCategory.Content.CategoryId = -1;
            //originalCategory.CategoryCode += "-COPY";
            originalCategory.Content.Name += "-COPY";

            var newCategory = _categoriesClient.AddCategory(originalCategory).Result.ReadAsAsync().Result;

            return Single(Mapper.Map<Category>(newCategory));
        }

        [WebGet(UriTemplate = "/tree/read/?id={id}")]
        public Task<Response<List<CategoryTreeNode>>> ReadChildTreeNodes(int? id)
        {
            id = id ?? 0;

            if (id == 0)
            {
                //todo:could return more than 200 and will need to page  
                var allCats = _categoriesClient.GetCategories(null, int.MaxValue, null, null, null).Result.ReadAsSync()
                    .Items
                    .OrderBy(x => x.Sequence)
                    .Select(Mapper.Map<CategoryTreeNode>)
                    .ToList();
                var catDic = allCats.ToDictionary ( x=> x.Id  );
                var retList = new List<CategoryTreeNode>();
                foreach (var item in allCats)
                {
                  //  item.loaded = true;
                    if (item.ParentId < 1)
                    {
                        retList.Add(item);
                    }
                    else
                    {
                        CategoryTreeNode parent;
                        if (catDic.TryGetValue(item.ParentId, out parent))
                        {
                            parent.Items = parent.Items ?? new List<CategoryTreeNode>();
                            parent.Items.Add(item);   
                        }
                    }

                    item.leaf = item.Items == null;
                }
                foreach (var item in allCats)
                {
                    item.leaf = item.Items == null;
                }
                return List(retList, allCats.Count);
            }
            var categories = _categoriesClient.GetChildCategories(id).Result.ReadAsSync();
            var categoryTreeNodes = Mapper.Map<List<CategoryTreeNode>>(categories.Items);

            return List(categoryTreeNodes, (int) categories.TotalCount);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/tree/duplicate/?id={id}")]
        public Task<Response<CategoryTreeNode>> DuplicateTreeNode(int id)
        {
            var originalCategory = _categoriesClient.GetCategory(id).Result.ReadAsAsync().Result;
            originalCategory.Id = -1;
            //originalCategory.Content.CategoryId = -1;
            //originalCategory.CategoryCode += "-COPY";
            originalCategory.Content.Name += "-COPY";

            var newCategory = _categoriesClient.AddCategory(originalCategory).Result.ReadAsAsync().Result;

            var categoryTreeNode = Mapper.Map<CategoryTreeNode>(newCategory);
            return Single(categoryTreeNode);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/tree/delete/?force={force}")]
        public Task<Response<CategoryTreeNode>> DeleteTreeNode(List<CategoryTreeNode> nodes, bool force)
        {
            // NOTE: Ugh... so the proxy has a weird "feature" when we are dealing with treestore
            // where everything needs to come in as an array
 
            var node = nodes[0];

            // Always force deletion of children for now
            _categoriesClient.DeleteCategoryById(node.Id, true).Wait();

            return EmptySingle<CategoryTreeNode>();
        }

        [WebInvoke(Method = "POST", UriTemplate = "/tree/create")]
        public Task<Response<CategoryTreeNode>> CreateTreeNode(List<CategoryTreeNode> nodes)
        {
            var node = nodes[0];

            var cat = new Contracts.Category
            {
                //CategoryCode = node.Name + "-default",
                //CategoryId = -1,
                Content = new CategoryLocalizedContent
                {
                    //CategoryId = -1,
                   // Description = "Default description for " + node.Name,
                    Name = node.Name,
                    LocaleCode = "en-US"
                },
                IsDisplayed = true,
                ParentCategoryId = node.ParentId > 0 ? (int?)node.ParentId : (int?)null,
                //ProductSetId = 1,
                Sequence = node.Index
            };

            var createdCategory = _categoriesClient.AddCategory (cat).Result.ReadAsAsync().Result;

            var categoryTreeNode = Mapper.Map<CategoryTreeNode>(createdCategory);

            return Single(categoryTreeNode);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/tree/update")]
        public Task<Response<List<CategoryTreeNode>>> UpdateTreeNode(List<CategoryTreeNode> nodes)
        {
           // var nodeResults = new List<CategoryTreeNode>();

            var allCats = _categoriesClient.GetCategories(null, null, null, null, null).Result.ReadAsSync();
            var tasks   = new List<System.Threading.Tasks.Task<CategoryTreeNode>>();
            foreach (var categoryTreeNode in nodes)
            {
                var originalCategory = allCats.Items.FirstOrDefault(x => x.Id == categoryTreeNode.Id);// _categoriesClient.GetCategoryById(categoryTreeNode.Id).Result.ReadAsAsync().Result;
                if (originalCategory == null)
                {
                    continue;
                }

                originalCategory.Content.Name = categoryTreeNode.Name;
                originalCategory.Sequence = categoryTreeNode.Index;
                originalCategory.ParentCategoryId = categoryTreeNode.ParentId > 0 ? (int?)categoryTreeNode.ParentId : (int?)null;
                originalCategory.IsDisplayed = !categoryTreeNode.IsHidden;
                
                tasks.Add(_categoriesClient.UpdateCategory(originalCategory, originalCategory.Id, false).ContinueWith ( x=> Mapper.Map<CategoryTreeNode>(x.Result .ReadAsSync())));

               
            }
            System.Threading.Tasks.Task.WaitAll(tasks.ToArray(), 60 * 1000);
            var nodeResults = tasks.Select ( x=> x.Result ).ToList ();
            //var updatedCategory = _categoriesClient.UpdateCategoryById(originalCategory, originalCategory.CategoryId).Result.ReadAsAsync().Result;

            //nodeResults.Add(Mapper.Map<CategoryTreeNode>(updatedCategory));

            return List(nodeResults, nodes.Count);
        }
    }
}
