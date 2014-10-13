using System;
using System.IO;
using Mozu.SiteBuilder.Mvc.Extensions;
using NDjango;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class HyprTemplateManager : ITemplateManager
    {
        private readonly ITemplateManager _innerTemplateManager;
     
        private readonly IMozuVirtualPathProvider _virtualPathProvider;
    //    private readonly ISiteBuilderContext _siteBuilderContext;
     //   private readonly string _themeId;

        public HyprTemplateManager(ITemplateManager innerTemplateManager, IMozuVirtualPathProvider virtualPathProvider )
        {
          //  _themeId = "food"; //siteBuilderContext.Theme.Id;
            _innerTemplateManager = innerTemplateManager;// ((TemplateManagerProvider)templateManagerProvider).GetNewManager();
            //_templateManagerProvider = templateManagerProvider;
            _virtualPathProvider = virtualPathProvider;
    //        _siteBuilderContext = siteBuilderContext;
        }


        ITemplate ITemplateManager.GetTemplate(string template)
        {
            var path = template;
            //var path = template.Split('|')[0];
            if (!Path.IsPathRooted(path))
            {
                string vpath = path;
                if (path.IndexOf("templates", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    vpath = "templates\\" + path;
                }

                vpath = vpath.GetFilePathNameWithoutExtension();

                var vFile = _virtualPathProvider.GetThemeFileInfo(vpath, false);
                if (vFile == null)
                {
                    throw new FileNotFoundException(string.Format( "invalid path [{0}]",  vpath),vpath );
                }
                path = vFile.FullPath;
            }

           // path += "|" + _themeId;
            return _innerTemplateManager.GetTemplate(path);

        }

        public ITemplate GetTemplateByAbsolutePath (string absolutePath)
        {
            return _innerTemplateManager.GetTemplate(absolutePath);
        }

        ITemplate ITemplateManager.GetTemplate(string template, TypeResolver.ITypeResolver resolver, TypeResolver.ModelDescriptor model)
        {
            //var path = template.Split('|')[0];
            var path = template;
            if (!Path.IsPathRooted(path))
            {
                string vpath = path;
                if (path.IndexOf("templates", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    vpath = "templates\\" + path;
                }

                vpath = vpath.GetFilePathNameWithoutExtension();

                var vFile = _virtualPathProvider.GetThemeFileInfo(vpath, false);
                if (vFile == null)
                {
                    throw new InvalidOperationException(string.Format("template not found [{0}]", vpath));
                }
                path = vFile.FullPath;
            }
          
            return _innerTemplateManager.GetTemplate(path, resolver, model);
        }

        TextReader ITemplateManager.RenderTemplate(string path, System.Collections.Generic.IDictionary<string, object> context)
        {
            //path = path.Split('|')[0];

            if (!Path.IsPathRooted(path))
            {
                string vpath = path;
                if (path.IndexOf("templates", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    vpath = "templates\\" + path;
                }

                vpath = vpath.GetFilePathNameWithoutExtension();

                var vFile = _virtualPathProvider.GetThemeFileInfo(vpath, false);
                if (vFile == null)
                {
                    throw new InvalidOperationException(string.Format("invalid virtual path [{0}]", vpath));
                }
                path = vFile.FullPath;
            }
            //path += "|" + _themeId;
            return ((ITemplateManager)this).GetTemplate(path).Walk(this, context);

        }


        public object Provider
        {
            get { return _innerTemplateManager.Provider; }
        }
    }
}