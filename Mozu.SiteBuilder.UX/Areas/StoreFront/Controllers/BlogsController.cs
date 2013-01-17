using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.CMS;

using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Xml;
using System.IO;
using System.ServiceModel.Syndication;
using System.Collections;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{

     [ValidateInput(false)]
    public class BlogsController : BaseController
    {
    
          
        IDocumentTypeWebApiClient _docTypeRepo;
        ICmsServiceWrapper _cmsService;
        ISiteBuilderContext _context;
        ICmsTypeHelper _cmsTypeHelper;
        BlogCache _cache;
        public BlogsController(
          
            IDocumentTypeWebApiClient docTypeRepo,
            ISiteBuilderContext context,
            IProvisioningHelper provHelper,
             ICmsServiceWrapper cmsService,
            ICmsTypeHelper cmsTypeHelper

            )
        {
            _cache = new BlogCache( cmsService );
          
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            _context = context;
            _cmsTypeHelper= cmsTypeHelper;

            

        }
        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            
            base.OnResultExecuting(filterContext);
        }
        //
        // GET: /StoreFront/Blog/


         class  BlogCache
         {
            
             ICmsServiceWrapper _cmsService;
             public BlogCache ( 
                 ICmsServiceWrapper cmsService)
             {
                 _cmsService = cmsService;
             }

             List<VM.Post> _posts;
             VM.Blog _blog;
             public List<VM.Post > Posts
             {
                 get
                 {
                     if (_posts == null)
                     {
                         _posts = _cmsService.GetList(new CmsListRequest() { Collection = "blogs", PageSize = 10, DocumentType = "post", Sort = new List<KeyValuePair<string, bool>>() { new KeyValuePair<string, bool>("InsertDate", false) } })
                             // _posts = _docRepo.List("blogs", null, null, null, CmsConstants.Documents.doc_state_active, "post", null,null, int.MaxValue, 0)
                             .Result.ReadAsSync().Items.Where(x => x.DocumentType == "post")
                             // .OrderByDescending   ( x=> x.InsertDate )
                             .Select(x => AutoMapper.Mapper.Map<Post>(x)).ToList();
                     }
                     return _posts;
                 }
             }
             IEnumerable<object> _archive;
             public IEnumerable<dynamic> Archive
             {
                 get
                 {
                     if (_archive == null)
                     {
                         _archive = _cmsService.GetFolderTree("blogs").Result.Item1.Children
                             .Select(x =>
                             {
                                 var j = new JObject();
                                 var d = (dynamic)j;
                                 d.url = "/blogs/archived/" + x.Folder.Name;
                                 d.caption = DateTime.ParseExact(x.Folder.Name, "MM-yyyy", System.Globalization.CultureInfo.CurrentCulture).ToString("MMMM yyyy");
                                 d.date = DateTime.ParseExact(x.Folder.Name, "MM-yyyy", System.Globalization.CultureInfo.CurrentCulture);
                                 return j.DeToken();
                             }).ToList();

                     }
                     return _archive;
                 }
             }
             public VM.Blog  Blog
             {
                 get
                 {
                     if (_blog == null)
                     {
                         _blog = _cmsService.GetList( new CmsListRequest() { Collection = "blogs", DocumentType = "blog" }).Result.ReadAsSync().Items.Select(x => AutoMapper.Mapper.Map<Blog>(x)).FirstOrDefault();
                         if (_blog != null)
                             _blog.Tags = Tags;
                     }
                     return _blog;
                 }
             }
             List<Facet> _tags;
             public List<Facet> Tags
             {
                 get
                 {
                     if (_tags == null)
                     {
                         _tags = _cmsService.GetFacets("blogs",  "tags").Result.ReadAsSync().OrderByDescending ( x=> x.Count ).Select(x=>Mapper.Map<Facet>(x)).ToList();
                         //_tags = this.Posts.Select(x => (x["tags"] as IEnumerable<object>)  ?? Enumerable.Empty <object>() ).SelectMany( x=> x).Select (x=>(string)x).Distinct().ToArray();
                     }
                     return _tags;
                 }
             }
         }
      
         public ActionResult Tagged ( string id )
         {
             var blog = _cache.Blog;
             var req = new CmsListRequest()
             {
                 Collection = "blogs",
                 DocumentType = "post",
                 PageSize  = 20
             };

             req.Filters.Add( string.Format ( "Properties.tags eq '{0}'", id))  ;
             blog.posts = _cmsService.GetList(req ).Result.ReadAsSync().Items.Select(x => Mapper.Map<Post>(x)).ToList();
             var pc = this.SiteContext.PageContext;
             pc.CollectionId = "blogs";
             pc.DocumentId = blog.Id;

             pc.Title = blog.Properties.GetValue("title") as string;
             pc.MetaTitle  = blog.Properties.GetValue("meta_title") as string;

             pc.MetaDescription = blog.Properties.GetValue("meta_description") as string;
             pc.PageType = "blog";

             return View("blog", blog);
             
         }

         public ActionResult PostList ( int? count )
         {
             var posts = this._cache.Posts.Take(count.HasValue ? count.Value : 5).ToList();
             return PartialView("recentposts", posts);
         }
         public ActionResult Tags()
         {
             var args = this.DjangoTemplateTagArguments;
             return PartialView("tags", _cache.Tags);
         }
         public ActionResult Archive( int? count= 24 , string sort =null )
         {
             var mdl = _cache.Archive.Take(count.Value);
             if (sort == "asc")
             {
                 mdl = mdl.OrderBy(x => (DateTime)x.date);
             }
             else
             {
                 mdl = mdl.OrderByDescending (x => (DateTime)x.date);
             }
             return PartialView("Archive", mdl.ToList());
         }
         public ActionResult Archived(string id)
         {
             var dt = DateTime.ParseExact(id, "MM-yyyy", System.Globalization.CultureInfo.CurrentCulture);

             var blog = _cache.Blog;
             blog.posts  = _cache.Posts.Where (x => x.date.Value.Month == dt.Month).ToList();

             var pc = this.SiteContext.PageContext;
             pc.CollectionId = "blogs";
             pc.DocumentId = blog.Id;

             pc.Title = blog.Properties.GetValue("title") as string;
             pc.MetaTitle = blog.Properties.GetValue("meta_title") as string;
             pc.MetaDescription = blog.Properties.GetValue("meta_description") as string;
             pc.PageType = "blog";

             return PartialView("index", blog);
         }
         

        public ActionResult Index()
        {
            

            var blog = _cache.Blog;
            blog.posts = _cache.Posts;
            var pc = this.SiteContext.PageContext;
            pc.CollectionId = "blogs";
            pc.DocumentId = blog.Id;

            pc.Title = blog.Properties.GetValue("title") as string;
            pc.MetaTitle = blog.Properties.GetValue("meta_title") as string;
            pc.MetaDescription = blog.Properties.GetValue("meta_description") as string;
            pc.PageType = "blog";


            return View("blog",blog);

        }

      


         class RssBlogAction : ActionResult
         {
             public Blog blog;
             public override void ExecuteResult(ControllerContext context)
             {
                 using (XmlWriter writer = XmlWriter.Create(context.HttpContext.Response.OutputStream ))
                 {

                     context.HttpContext.Response.ContentType = "text/xml";

                     // Set the feed properties
                     SyndicationFeed feed = new SyndicationFeed((string)blog["title"], (string)blog["description"], new Uri("http://fud.com"));


                    
                     List<SyndicationItem> items = new List<SyndicationItem>();
                     foreach (var post in blog.posts)
                     {
                         SyndicationItem item = new SyndicationItem();
                         item.Id = post.Id;
                         item.Title = TextSyndicationContent.CreatePlaintextContent(post["title"] as string);
                         item.Content = SyndicationContent.CreateXhtmlContent(post["body"] as string);
                         item.PublishDate = new DateTimeOffset(post.date.Value);
                         item.AttributeExtensions.Add ( new XmlQualifiedName("url"), new Uri(context.RequestContext.HttpContext.Request.Url, "/blogs/" + post.Name).ToString ());
                         //item.Links.Add(new SyndicationLink();
                         items.Add(item);
                     }
                     feed.Items = items;

                     // Write the feed to output
                     Rss20FeedFormatter rssFormatter = new Rss20FeedFormatter(feed);
                     rssFormatter.WriteTo(writer);

                     writer.Flush();
                 }
                
             }
         }
        public ActionResult Rss()
        {
             var blog = _cache.Blog;
                blog.posts = _cache.Posts;
            RssBlogAction ba = new RssBlogAction(){blog =blog  };
            return ba;
       
            

        }
  

        

         [HttpGet]
        public ActionResult Post(string post)
        {


            DC.Document doc = _cmsService.GetByPath("blogs", post, null).Result.ReadAsSync();

            //pants
            if (doc == null)
                return new HttpNotFoundResult("not found dumb dumb");

            var vm = Mapper.Map<DC.Document , VM.Post>(doc);

            vm.author = (string)_cache.Blog.config.author;
            var pc = this.SiteContext.PageContext;
            
            pc.CollectionId = "blogs";
            pc.DocumentId = doc.Id;
           
            pc.Title = vm.Properties.GetValue("title") as string;
            pc.MetaTitle = vm.Properties.GetValue("meta_title") as string;
            pc.MetaDescription = vm.Properties.GetValue("meta_description") as string;
            pc.PageType = (string)(vm.Properties.GetValue("page_type")) ?? "post";



            var template = ((string)(vm.Properties.GetValue("template")) ?? this.HttpContext.Request["template"] ?? "post");


            var result = View(template, vm);




            return result;
        }



    }
}
