using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;using DC = Mozu.Content.Contracts;
using System;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.Mvc.CMS;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/image", SuppressDescriptorGeneration = true)]
    public class ImageController : BaseController
    {
      //  private readonly IContentCollectionWebApiClient   _contentCollecitonRepo;
        private readonly IDocumentListWebApiClient _docRepo;
        ICmsServiceWrapper _cmsService;
      //  private readonly IDocumentTypeWebApiClient  _docTypeRepo;
    //    IFolderWebApiClient _folderRepo;
        public ImageController(
            ICmsServiceWrapper cmsService,
            IDocumentListWebApiClient docRepo
      //      IFolderWebApiClient folderRepo
        //    IDocumentTypeWebApiClient docTypeRepo,
        ) 
        {

            _cmsService = cmsService;
            _docRepo = docRepo;
        //    _folderRepo = folderRepo;
          //  _docTypeRepo = docTypeRepo;
            //Provision();
        }

		[HttpPostRoute(UriTemplate = "document/create")]
        public async Task<Response<ProductImageDocument>> CreateDocument(ProductImageDocument doc)
        {
            //var properties = new List<DC.PropertyValue>
            //{ 
            //    //new DC.PropertyValue {
            //    //    PropertyType  = "alttext",
            //    //    Value = doc.AltText
            //    //},

            //    new DC.PropertyValue {
            //        PropertyType = "original_path",
            //        Value = doc.FileName
            //    },

            //    //new DC.PropertyValue {
            //    //    PropertyType = "caption",
            //    //    Value = doc.Caption
            //    //},

            //    //new DC.PropertyValue {
            //    //    Name = "productId",
            //    //    Value = doc.ProductId
            //    //}            
            //};
            //var productFolder = (await _folderRepo.GetByPath("files@mozu", "/products")).ReadAsSync();
            //if (productFolder == null)
            //{
            //    productFolder = (await _folderRepo.Create("files@mozu", new DC.Folder() { ListFQN = "files@mozu", Name = "products", Path = "/" })).ReadAsSync();

            //}
            string fileName = doc.FileName;
           // string filter = String.Format("FolderId eq '{0}' and name sw \"{1}\"", productFolder.Id, Path.GetFileNameWithoutExtension(fileName));

            var task = _cmsService.GetList2(contentCollection: "files@mozu");

            var matchingFiles = (await task).ReadAsSync();

            if (matchingFiles.TotalCount > 0 )
            {
                for (int i = 1; i < matchingFiles.TotalCount +1; i++) 
                 {
                     fileName = System.IO.Path.GetFileNameWithoutExtension(doc.FileName) + "_" + i + System.IO.Path.GetExtension (doc.FileName);
                     if ( !matchingFiles.Items.Any ( x=> fileName.Equals ( x.Name, StringComparison.OrdinalIgnoreCase )))
                     {
                         break;
                     }
                 }
               
            }
           
            var cmsDoc = new DC.Document()
            {
                DocumentTypeFQN = "image@mozu",
              //  FolderId = productFolder.Id,
                //Properties = properties,
                ListFQN = "files@mozu",
                //ContentSummary = new ContentStreamSummary()
                //{
                //   // MimeType = "image/jpeg"
                //}
                Name = fileName
            };

            var result = (await _docRepo.CreateDocument("files@mozu", cmsDoc)).ReadAsSync();
            
            // TODO: Get AutoMapper set up
            doc.Id = result.Id;

            return Single2(doc);
        }

		[HttpPostRoute(UriTemplate = "{docid}/create")]
        public Task<Response<string>> CreateImage(HttpRequestMessage request, string docid)
        {
            if (!request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            //todo add session id 
            var streamProvider = new MultipartFormDataStreamProvider(System.IO.Path.GetTempPath());
            
            /*var bodyparts = request.Content.ReadAsMultipart(streamProvider);
            var bodyPartFileNames = streamProvider.BodyPartFileNames;
            var f = bodyPartFileNames.SingleOrDefault().Value;*/

            var fileinfo = new FileInfo(streamProvider.FileData.SingleOrDefault().LocalFileName);

            HttpResponseMessage result = null;

            using(var fs = fileinfo.OpenRead())
            {
                result = _docRepo.UpdateDocumentContent("files@mozu", docid, fs).Result.ResponseMessage;                
            }

            return Message<string>(result.IsSuccessStatusCode, "File uploaded");
        }
    }
}