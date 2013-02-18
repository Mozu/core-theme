using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
//using Volusion.ProductAdmin.Contracts.Clients;
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
namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class FileManagementController : BaseController
    {
        private ITenantCmsServiceWrapper _cmsService;

        public FileManagementController(IProvisioningHelper provHeler, ICmsServiceWrapper cmsService, ITenantCmsServiceWrapper tenantCmsServiceWrapper)
        {
            _cmsService = tenantCmsServiceWrapper;
            provHeler.ProvisionCms();
        }

        [WebGet(UriTemplate = "file/list")]
        public Task<Response<List<FileManagementFile>>> FileList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            List<FileManagementFile> vm = null;
            int totalCount = 0;
            string tmp;
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                //var ret = _docClient.Get("files", pagingParams.id, null, null).Result.ReadAsSync();
                var ret = _cmsService.Get("files", pagingParams.id, null, null).Result.ReadAsSync();
                vm = new List<FileManagementFile>() { AutoMapper.Mapper.Map<FileManagementFile>(ret) };
                totalCount = 1;
            }
            else if (extFilter.TryGetValue<string>("id", out tmp))
            {
                
                var tasks =extFilter.Where(x => x.field == "id").Select(
                    extF => _cmsService.Get("files", (string)extF.value, null, CmsConstants.Documents.doc_state_active)).ToArray();
                    //extF => _docClient.Get("files", (string)extF.value, null, CmsConstants.Documents.doc_state_active)).ToArray();

                
                Task.WaitAll(tasks);
                vm = tasks.Where(x => !x.Result.HasException).Select(x => x.Result.ReadAsSync()).Select(x => Mapper.Map<FileManagementFile>(x)).ToList();
                totalCount = vm.Count;
            }
            else
            {
                
                var name = extFilter.GetValue<string>("name", null);
                name = string.IsNullOrEmpty ( name ) ? null : name;


                //var folderId = extFilter.GetValue<string>("folderid") ?? _folderClient.GetByPath("files", null).Result.ReadAsSync().Id;
                var folderId = extFilter.GetValue<string>("folderid");
                if (folderId == null)
                {
                    try
                    {
                        folderId = _cmsService.GetByPath("files", "/").Result.ReadAsSync().Id;
                    }
                    catch (Exception e)
                    {
                        folderId = "";
                    }
                }
                var req = new CmsListRequest()
                    {
                        Collection = "files",
                        FolderId = folderId
                    };
                //todo: if name is set ... then user is search ... so recurse
                if (!string.IsNullOrEmpty (name ))
                {
                    req.Recurse = true;
                    req.Filters.Add(string.Format("Name cont \"{0}\"", name));
                }

                var ret = _cmsService.GetList(req).Result.ReadAsSync();

                
                vm = ret.Items.Select(x => AutoMapper.Mapper.Map<FileManagementFile>(x)).ToList();
                totalCount = (int) ret.TotalCount;
            }

            return List(vm, totalCount);
        }

        [WebInvoke(UriTemplate = "file/create")]
        public Task<Response<List<FileManagementFile>>> CreateFile(List<FileManagementFile> files)
        {
            List<FileManagementFile> vmList = new List<FileManagementFile>();
            foreach (var file in files)
            {
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
               dm = _cmsService.Create("files", dm).Result.ReadAsSync();
                var vm = AutoMapper.Mapper.Map<FileManagementFile>(dm);
                vmList.Add(vm);
            }

            return List(vmList);
        }

        [WebInvoke(UriTemplate = "file/delete")]
        public Task<Response<FileManagementFile>> DeleteFile(List<FileManagementFile> files)
        {
            bool b = true;
            foreach ( var file in files)
            {
                //b = _docClient.Delete("files", file.id, null).Result.ResponseMessage.IsSuccessStatusCode;
                b = _cmsService.Delete("files", file.id, null).Result.ResponseMessage.IsSuccessStatusCode;

            
            }

            return EmptySingle<FileManagementFile>(b);
        }

        [WebInvoke(Method = "POST", UriTemplate = "file/upload/{docid}")]
        public Task<Response<string>> UploadContent(HttpRequestMessage request,string docid)
        {
            //todo add session id 
            var streamProvider = new MultipartFormDataStreamProvider(System.IO.Path.GetTempPath());
            /*var bodyparts = request.Content.ReadAsMultipart(streamProvider);
            var bodyPartFileNames = streamProvider.BodyPartFileNames;
            var f = bodyPartFileNames.SingleOrDefault().Value;*/


            var fileinfo = new System.IO.FileInfo(streamProvider.FileData.SingleOrDefault().LocalFileName);


            HttpResponseMessage result = null;

            using(var fs = fileinfo.OpenRead())
            {
                //result = _docClient.UpdateDocumentContent("files", docid , fs).Result.ResponseMessage;                
                result = _cmsService.UpdateDocumentContent("files", docid , fs).Result.ResponseMessage;                
            }

            return Message<string>(result.IsSuccessStatusCode, "File uploaded");
        }



         [WebGet(UriTemplate = "folder/list")]
        public Task<Response<List<FileManagementFolder>>> FolderList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var folderId = extFilter.GetValue<string>("folderid");

            //var ret = _folderClient.GetFolderTree("files", folderId, 99).Result.ReadAsSync();
            var ret = _cmsService.GetFolderTree("files").Result.ReadAsSync();
           
             
            var vm = Mapper.Map<FileManagementFolder>(ret);

            vm.name  ="All Files";
             vm.expanded = true;

             return List(vm);
        }

        [WebInvoke(UriTemplate = "folder/create")]
         public Task<Response<List<FileManagementFolder>>> CreateFolder(List<FileManagementFolder> folders)
        {
            List<FileManagementFolder> vms = new List<FileManagementFolder>();
            foreach (var fldr in folders)
            {
                var dm = new Mozu.Content.Contracts.Folder()
                {
                    Name = fldr.name,
                    ParentId = fldr.parentId,
                    Id = fldr.id,
                    DocumentListName = "files"
                };
                //var ret = _folderClient.Create("files", dm).Result.ReadAsSync();
                var ret = _cmsService.Create("files", dm).Result.ReadAsSync();
                var vm = new FileManagementFolder()
                {
                      id = ret.Id,
                      name = ret.Name,
                      parentId = ret.ParentId 
                };
                vms.Add(vm);
            }

            return List(vms);
        }

        [WebInvoke(UriTemplate = "file/edit")]
        public Task<Response<List<FileManagementFile>>> EditFile(FileManagementFile[] files)
        {
            var vms = new List<FileManagementFile>();
            foreach (var file in files)
            {
                //var dm = _docClient.Get("files", file.id, null, CmsConstants.Documents.doc_state_active ).Result.ReadAsSync();
                var dm = _cmsService.Get("files", file.id, null, CmsConstants.Documents.doc_state_active ).Result.ReadAsSync();
                dm.Name = file.name;
                dm.FolderId = file.folderId;
                //var ret = _docClient.Update ( "files", dm.Id,  dm).Result.ReadAsSync();
                var ret = _cmsService.Update("files", dm.Id, dm).Result.ReadAsSync();

                var vm = Mapper.Map<FileManagementFile>(ret);
                vms.Add(vm);
            }

            return List(vms);
        }



         [WebInvoke(UriTemplate = "folder/edit")]
        public Task<Response<List<FileManagementFolder>>> EditFolder(List<FileManagementFolder> fldrs)
        {
            var vms = new List<FileManagementFolder>();
            foreach (var fldr in fldrs)
            {
                var dm = new Mozu.Content.Contracts.Folder()
                {
                    Name = fldr.name,
                    ParentId = fldr.parentId,
                    Id = fldr.id,
                    DocumentListName = "files"
                };
                //var ret = _folderClient.Update("files", dm.Id, dm).Result.ReadAsSync();
                var ret = _cmsService.Update("files", dm.Id, dm).Result.ReadAsSync();
                
                var vm = Mapper.Map<FileManagementFolder>(ret);
                vms.Add(vm);
            }

             return List(vms);
        }

        [WebInvoke(UriTemplate = "folder/delete")]
        public Task<Response<FileManagementFolder>> DeleteFolder(List<FileManagementFolder> fldrs)
        {
            bool success = true;
            foreach (var fldr in fldrs)
            {
                //var ret = _folderClient.Delete("files", fldr.id).Result.ResponseMessage;
                var ret = _cmsService.Delete("files", fldr.id).Result.ResponseMessage;
                if (!ret.IsSuccessStatusCode)
                {
                    success = false;
                }
            }

              return EmptySingle<FileManagementFolder>(success);
        }
    }
}