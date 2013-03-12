using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc;
using Mozu.ProductAdmin.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class SiteDirectoryController : BaseController
    {
           // ICmsTypeHelper _cmsTypeHelper;
        ISiteBuilderContext _sbCtx;
        ICmsServiceWrapper _cmsService;
        ICategoryWebApiClient _catClient;
        //ISessionDocumentStore _sessionDocStore;
        IProductWebApiClient _prodService;

        public SiteDirectoryController(
            ISiteBuilderContext sbCtx,
          ICategoryWebApiClient catClient,
             ICmsServiceWrapper cmsService,
            IProductWebApiClient prodService
            )
        {
            _catClient = catClient;
            _sbCtx = sbCtx;
            _cmsService = cmsService;
            _prodService = prodService;
        }
        const  string STRINGSPLITDELIM = "^^";

        [WebGet(UriTemplate = "read/?id={id}")]
        public async Task<Response<List<SiteDirectoryNode>>> Read(string id)
        {
            var resItems = new List<SiteDirectoryNode>();
            if (id == null || id == "root")
            {
                resItems.Add(new SiteDirectoryNode()
                {
                    name = "Pages",
                    id = "folder" + STRINGSPLITDELIM + "pages" ,

                    leaf = false 
                });

                var blogTask = _cmsService.GetList(new CmsListRequest()
                {
                    Collection = "blogs", 
                    DocumentType = "blog",
                    PageSize = 1
                });

                var blogDoc = (await blogTask).ReadAsSync().Items.FirstOrDefault();
                if (blogDoc != null)
                {
                    resItems.Add(new SiteDirectoryNode()
                    {
                        name = blogDoc.Name,
                        nodeType = "blog",
                        url = "/blogs",
                        id="blog"
                    });
                }

                resItems.Add(new SiteDirectoryNode()
                {
                    id = "category"+ STRINGSPLITDELIM +"root",
                    name = "Product Categories"
                });

                return List2(resItems);
            }
           

            var parts = id.Split(new string[] { STRINGSPLITDELIM  }, StringSplitOptions.None);

            switch (parts[0])
            {
                case "blog":
                    {
                        var folders = _cmsService.GetFolderTree("blogs").Result.Item1.Children
                            .Select (f=> new SiteDirectoryNode ()
                            {
                                name =DateTime.ParseExact ( f.Folder.Name, "MM-yyyy", System.Globalization.CultureInfo.CurrentCulture ).ToString ("MMMM yyyy" ),
                                leaf = false,
                                id = "folder" + STRINGSPLITDELIM + "blogs" + STRINGSPLITDELIM  + f.Folder.Id   
                            });
            
                        resItems.AddRange ( folders );
                        break;
                    }
                case "folder":
                    {
                        var pages= _cmsService.GetList ( new CmsListRequest(){
                            FolderId = parts.Length == 3 ? parts[2] : null,
                            PageSize = 100,
                            Collection = parts[1]
                        }).Result.ReadAsSync ().Items.Select(x=>
                            new SiteDirectoryNode (){
                                name = x.Name, 
                                leaf = true,
                                url = "/" + x.DocumentListName + "/" + x.Name  

                            });
                        resItems.AddRange( pages )   ;
                        break;
                    }

                case "category":
                    {
                        int catId = 0;

                        if (!int.TryParse(parts[1], out catId))
                        {
                            catId = 0;

                        }
                        var catTask = _catClient.GetChildCategories(catId);

                        var prodTask = _prodService.GetProducts(0, 200, "Content.ProductName", null, string.Format("CategoryId eq {0}", catId));
                        Task.WaitAll(catTask, prodTask);
                        var catNodes = (await catTask).ReadAsSync().Items
                            
                            .Select(x =>
                                new SiteDirectoryNode()
                                {
                                    id = "category" + STRINGSPLITDELIM + x.Id,
                                    name = x.Content.Name,
                                    leaf = false,
                                    url = "/category/" + x.Id

                                });
                        var prodNodes = (await prodTask).ReadAsSync().Items.Select(x =>
                            new SiteDirectoryNode
                            {
                                id = "prod" + STRINGSPLITDELIM + x.ProductCode ,
                                name = x.Content.ProductName,
                                url = "/product/" + x.ProductCode,
                                leaf = true
                            });

                        resItems.AddRange(catNodes);
                        resItems.AddRange(prodNodes);


                        break;
                    }
                default:
                    {
                        return List2(resItems);
                    }
            }
            return List2(resItems);
        }
    }
    
    [DataContract ()]
    public class SiteDirectoryNode
    {
        [DataMember ()]
        public string id { get; set; }

        [DataMember()]
        public string parentId { get; set; }

        [DataMember()]
        public string collection { get; set; }
        [DataMember()]
        public string name { get; set; }
        [DataMember()]
        public string nodeType { get; set; }
        [DataMember()]
        public string url { get; set; }
        [DataMember(EmitDefaultValue = false)]
        public List<SiteDirectoryNode> items { get; set; }
        [DataMember()]
        public bool leaf { get; set; }

        //[DataMember( EmitDefaultValue=false)]
        //public bool? expandable { get; set; }

        // [DataMember( EmitDefaultValue=false)]
        //public bool? expanded { get; set; }
        
        //[DataMember(EmitDefaultValue = false)]
        //public bool? loaded { get; set; }
    }
    
}