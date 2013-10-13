using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http.Headers;
using System.ServiceModel;
//using Volusion.ProductAdmin.Contracts.Clients;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.Content.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
using System.Net.Http;
using System.Text;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.CMS;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using System.IO;
using Mozu.Core.Api.Client;
namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/filemanagement", SuppressDescriptorGeneration = true)]
    public class FileManagementController : BaseController
    {
        private readonly IDocumentListWebApiClient _documentWebApiClient;
       // private Mozu.Content.Contracts.Clients.IDocumentListWebApiClient  _cmsService;

        public FileManagementController(ICmsServiceWrapper cmsService, IDocumentListWebApiClient documentWebApiClient)
        {
            _documentWebApiClient = documentWebApiClient.CloneWithApiContext( x => { x.SiteId = null; });

            // _cmsService = tenantCmsServiceWrapper;
        }

        [HttpGetRoute(UriTemplate = "file/list")]
        public async Task<Response<List<FileManagementFile>>> FileList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            List<FileManagementFile> vm = null;
            int totalCount = 0;
            string tmp;
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                //var ret = _docClient.Get("files", pagingParams.id, null, null).Result.ReadAsSync();
                var ret = (await _documentWebApiClient.GetDocument(
                    documentListName : "files", 
                    documentId :pagingParams.id
                    )).ReadAsSync();
                vm = new List<FileManagementFile>() { Mapper.Map<FileManagementFile>(ret) };
                totalCount = 1;
            }
            else if (extFilter.TryGetValue<string>("id", out tmp))
            {
                
                var tasks =extFilter.Where(x => x.field == "id").Select(
                    extF => _documentWebApiClient.GetDocument("files", documentId:(string)extF.value )).ToArray();
                    //extF => _docClient.Get("files", (string)extF.value, null, CmsConstants.Documents.doc_state_active)).ToArray();

                
                await Task.WhenAll(tasks);
                vm = tasks.Where(x => !x.Result.HasException).Select(x => x.Result.ReadAsSync()).Select(x => Mapper.Map<FileManagementFile>(x)).ToList();
                totalCount = vm.Count;
            }
            else
            {


                var ret = (await _documentWebApiClient.GetDocuments(documentListName: "files", pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex )).ReadAsSync();
                vm = AutoMapper.Mapper.Map<List<FileManagementFile>>(ret.Items);
                totalCount = (int)ret.TotalCount;



                

                
            }

            return List2(vm, totalCount);
        }

        [HttpPostRoute(UriTemplate = "file/create")]
        public async Task<Response<List<FileManagementFile>>> CreateFile(List<FileManagementFile> files)
        {
            List<FileManagementFile> vmList = new List<FileManagementFile>();
            foreach (var file in files)
            {
                string nameWoExt = System.IO.Path.GetFileNameWithoutExtension(file.name );
                string ext = System.IO.Path.GetExtension(file.name);
                var t = _documentWebApiClient.GetDocuments(documentListName: "files",pageSize:200,  filter: string.Format("name sw \"{0}\"", nameWoExt));
               
                var existingFiles = (await _documentWebApiClient.GetDocuments(documentListName: "files", filter: string.Format("name sw \"{0}\"", nameWoExt))).ReadAsSync().Items;
               // if ( existingFiles.Count > 0 || existingFiles.Any())
                if (existingFiles.Count > 0 || existingFiles.Any(x => x.Name.Equals(file.name, StringComparison.OrdinalIgnoreCase)))
                {
                   
                    for (int i = 1; i < 200; i++)
                    {
                        file.name = nameWoExt + "_" + i + ext;
                        if (!existingFiles.Any(x => x.Name.Equals(file.name, StringComparison.OrdinalIgnoreCase)))
                        {
                            break;
                        }
                    }
                    
                }
                var dm = new Mozu.Content.Contracts.Document()
                 {
                     Name = file.name,
                     Id = file.id,
                     FolderId = file.folderId == "0" ? null : file.folderId,
                     PublishState = CmsConstants.Documents.doc_state_active,
                     DocumentType = "image", //todo: file.fileType != null && file.fileType.IndexOf("im", StringComparison.OrdinalIgnoreCase) > -1 ? "image" : "document",
                     Properties = new List<DC.PropertyValue>()
                     {
                         new DC.PropertyValue(){
                             PropertyType = "height",
                             Value = file.height
                         },
                         new DC.PropertyValue(){
                             PropertyType = "width",
                             Value=file.width
                         }

                     }
                 };
                //var existing = _docClient.List("files", dm.Name, null, dm.FolderId, CmsConstants.Documents.doc_state_active, null, null, null, 1, 0).Result.ReadAsSync().Items.FirstOrDefault();
                //if (existing != null)
                //{
                //    dm = existing;
                //}
                //else
                //{
                //    dm = _docClient.Create("files", dm).Result.ReadAsSync();
                //}

               //dm = _docClient.Create("files", dm).Result.ReadAsSync();
                dm = (await _documentWebApiClient.CreateDocument("files", dm)).ReadAsSync();
                var vm = Mapper.Map<FileManagementFile>(dm);
                vmList.Add(vm);
            }

            return List2(vmList);
        }

        [HttpPostRoute(UriTemplate = "file/delete")]
        public async Task<Response<FileManagementFile>> DeleteFile(List<FileManagementFile> files)
        {
            bool b = true;
            foreach ( var file in files)
            {
                //b = _docClient.Delete("files", file.id, null).Result.ResponseMessage.IsSuccessStatusCode;
                b = (await _documentWebApiClient.DeleteDocument(documentListName: "files", documentId :file.id)).ResponseMessage.IsSuccessStatusCode;

            
            }

            return EmptySingle2<FileManagementFile>(b);
        }

        [HttpPostRoute(UriTemplate = "file/upload/{docid}")]
        public async Task<Response<string>> UploadContent(HttpRequestMessage request,string docid)
        {
            //todo add session id 
            var streamProvider = new MultipartFormDataStreamProvider(System.IO.Path.GetTempPath());

            await request.Content.ReadAsMultipartAsync(streamProvider);

            /*var bodyparts = request.Content.ReadAsMultipart(streamProvider);
            var bodyPartFileNames = streamProvider.BodyPartFileNames;
            var f = bodyPartFileNames.SingleOrDefault().Value;*/


            var fileinfo = new FileInfo(streamProvider.FileData.SingleOrDefault().LocalFileName);


            HttpResponseMessage result = null;

            using(var fs = fileinfo.OpenRead())
            {
               var nvc = new NameValueCollection();
                nvc["Content-Type"] =  streamProvider.FileData.SingleOrDefault().Headers.ContentType.MediaType;

                var client = _documentWebApiClient.CloneWithConfigOptions(x => x.ContentType = streamProvider.FileData.SingleOrDefault().Headers.ContentType );

             
                {
                    //hack to work around bug in api....sent to roeder.
                 //   client.Handler = new MyServiceClientMessageHandler((ServiceClientMessageHandler)client.Handler, streamProvider.FileData.SingleOrDefault().Headers.ContentType );
                }
                
                

                //result = _docClient.UpdateDocumentContent("files", docid , fs).Result.ResponseMessage;                
                result = (await client.UpdateDocumentContent("files", docid, fs)).ResponseMessage;                
            }

            return Message3<string>(result.IsSuccessStatusCode, "File uploaded");
        }

        //public class MyServiceClientMessageHandler : ServiceClientMessageHandler, IServiceClientMessageHandler
        //{
        //    private readonly MediaTypeHeaderValue _contentType;

        //    public MyServiceClientMessageHandler(ServiceClientMessageHandler innerClient, MediaTypeHeaderValue contentType)
        //        : base(innerClient.ApiContext, innerClient.Settings, innerClient.CacheFactory)
        //    {
        //        _contentType = contentType;
        //    }

        //    public override void InitRequest(HttpRequestMessage request)
        //    {
        //        request.Content.Headers.ContentType = _contentType;
        //        base.InitRequest(request);
        //    }
        //}

    


        // [HttpGetRoute(UriTemplate = "folder/list")]
        //public async Task<Response<List<FileManagementFolder>>> FolderList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        //{
        //    var folderId = extFilter.GetValue<string>("folderid");

        //    //var ret = _folderClient.GetFolderTree("files", folderId, 99).Result.ReadAsSync();
        //    var ret = (await _documentWebApiClient.GetFolderTree("files")).ReadAsSync();
           
             
        //    var vm = Mapper.Map<FileManagementFolder>(ret);

        //    vm.name  ="All Files";
        //     vm.expanded = true;

        //     return List2(vm);
        //}

        //[HttpPostRoute(UriTemplate = "folder/create")]
        //public async Task<Response<List<FileManagementFolder>>> CreateFolder(List<FileManagementFolder> folders)
        //{
        //    List<FileManagementFolder> vms = new List<FileManagementFolder>();
        //    foreach (var fldr in folders)
        //    {
        //        var dm = new Mozu.Content.Contracts.Folder()
        //        {
        //            Name = fldr.name,
        //            ParentId = fldr.parentId,
        //            Id = fldr.id,
        //            DocumentListName = "files"
        //        };
        //        //var ret = _folderClient.Create("files", dm).Result.ReadAsSync();
        //        var ret = (await _cmsService.Create("files", dm)).ReadAsSync();
        //        var vm = new FileManagementFolder()
        //        {
        //              id = ret.Id,
        //              name = ret.Name,
        //              parentId = ret.ParentId 
        //        };
        //        vms.Add(vm);
        //    }

        //    return List2(vms);
        //}

        [HttpPostRoute(UriTemplate = "file/edit")]
        public async Task<Response<List<FileManagementFile>>> EditFile(FileManagementFile[] files)
        {
            var vms = new List<FileManagementFile>();
            foreach (var file in files)
            {
                //var dm = _docClient.Get("files", file.id, null, CmsConstants.Documents.doc_state_active ).Result.ReadAsSync();
                var dm = (await _documentWebApiClient.GetDocument(documentListName : "files", documentId: file.id)).ReadAsSync();
                dm.Name = file.name;
               // dm.FolderId = file.folderId;
                //var ret = _docClient.Update ( "files", dm.Id,  dm).Result.ReadAsSync();
                var ret = (await _documentWebApiClient.UpdateDocument("files", dm.Id, dm)).ReadAsSync();

                var vm = Mapper.Map<FileManagementFile>(ret);
                vms.Add(vm);
            }

            return List2(vms);
        }



        // [HttpPostRoute(UriTemplate = "folder/edit")]
        //public async Task<Response<List<FileManagementFolder>>> EditFolder(List<FileManagementFolder> fldrs)
        //{
        //    var vms = new List<FileManagementFolder>();
        //    foreach (var fldr in fldrs)
        //    {
        //        var dm = new Mozu.Content.Contracts.Folder()
        //        {
        //            Name = fldr.name,
        //            ParentId = fldr.parentId,
        //            Id = fldr.id,
        //            DocumentListName = "files"
        //        };
        //        //var ret = _folderClient.Update("files", dm.Id, dm).Result.ReadAsSync();
        //        var ret = (await _cmsService.Update("files", dm.Id, dm)).ReadAsSync();
                
        //        var vm = Mapper.Map<FileManagementFolder>(ret);
        //        vms.Add(vm);
        //    }

        //     return List2(vms);
        //}

        //[HttpPostRoute(UriTemplate = "folder/delete")]
        //public async Task<Response<FileManagementFolder>> DeleteFolder(List<FileManagementFolder> fldrs)
        //{
        //    bool success = true;
        //    foreach (var fldr in fldrs)
        //    {
        //        //var ret = _folderClient.Delete("files", fldr.id).Result.ResponseMessage;
        //        var ret = (await _cmsService.Delete("files", fldr.id)).ResponseMessage;
        //        if (!ret.IsSuccessStatusCode)
        //        {
        //            success = false;
        //        }
        //    }

        //      return EmptySingle2<FileManagementFolder>(success);
        //}
    }
}