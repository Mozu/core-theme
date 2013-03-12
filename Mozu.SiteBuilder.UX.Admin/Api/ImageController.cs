using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;using DC = Mozu.Content.Contracts;
using System;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.Mvc.CMS;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ImageController : BaseController
    {
      //  private readonly IContentCollectionWebApiClient   _contentCollecitonRepo;
        private readonly IDocumentWebApiClient _docRepo;
        ICmsServiceWrapper _cmsService;
      //  private readonly IDocumentTypeWebApiClient  _docTypeRepo;
        IFolderWebApiClient _folderRepo;
        public ImageController(
            ICmsServiceWrapper cmsService,
            IDocumentWebApiClient docRepo,
            IFolderWebApiClient folderRepo,
        //    IDocumentTypeWebApiClient docTypeRepo,
            Mozu.SiteBuilder.Mvc.CMS.IProvisioningHelper provHelper) 
        {

            _cmsService = cmsService;
            _docRepo = docRepo;
            _folderRepo = folderRepo;
          //  _docTypeRepo = docTypeRepo;
            provHelper.ProvisionCms();
            //Provision();
        }

        [WebInvoke(Method = "POST", UriTemplate = "document/create")]
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
            var productFolder = (await _folderRepo.GetByPath("files", "/products")).ReadAsSync();
            if (productFolder == null)
            {
                productFolder = (await _folderRepo.Create("files", new DC.Folder() { DocumentListName = "files", Name = "products", Path = "/" })).ReadAsSync();

            }
            string fileName = doc.FileName;
            var req = new CmsListRequest(){
                Collection = "files",
                FolderId = productFolder.Id 
            };
            req.Filters.Add ( string.Format ( "name sw \"{0}\"", System.IO.Path.GetFileNameWithoutExtension(doc.FileName) ));
            var matchingFiles = (await _cmsService.GetList(req)).ReadAsSync();

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
                DocumentType = "image",
                FolderId = productFolder.Id,
                //Properties = properties,
                DocumentListName = "files",
                //ContentSummary = new ContentStreamSummary()
                //{
                //   // MimeType = "image/jpeg"
                //}
                Name = fileName
            };
            
            var result = (await _docRepo.Create("files", cmsDoc)).ReadAsSync();
            
            // TODO: Get AutoMapper set up
            doc.Id = result.Id;

            return Single2(doc);
        }

        [WebInvoke(Method = "POST", UriTemplate = "{docid}/create")]
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
                result = _docRepo.UpdateDocumentContent("files", docid, fs).Result.ResponseMessage;                
            }

            return Message<string>(result.IsSuccessStatusCode, "File uploaded");
        }
    }
}