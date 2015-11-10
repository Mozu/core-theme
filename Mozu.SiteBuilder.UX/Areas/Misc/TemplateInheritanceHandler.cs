using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.Misc.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.Misc
{
    public interface ITemplateInheritanceHandler
    {
        Task<IEnumerable<TemplateInfo>> GetAndExpandTemplates();
    }

    public class TemplateInheritanceHandler : ITemplateInheritanceHandler
    {
        private readonly IMozuVirtualPathProvider _pathProvider;
        private readonly IThemeContentRetriever _contentRetriever;
        private readonly ILogger _logger;

        public TemplateInheritanceHandler(IMozuVirtualPathProvider pathProvider, IThemeContentRetriever contentRetriever, ILogger logger)
        {
            _pathProvider = pathProvider;
            _contentRetriever = contentRetriever;
            _logger = logger;
        }

        public async Task<IEnumerable<TemplateInfo>> GetAndExpandTemplates()
        {
            var templateContentsTasks =
            _pathProvider.GetLiveTemplates().Select(async x => await RetrieveTemplateContent(x));
            var templateContents = await Task.WhenAll(templateContentsTasks);
            var expansionTasks = templateContents.Select(async x => await FetchParentTemplates(x));
            var expandedInfos = (await Task.WhenAll(expansionTasks)).SelectMany(x => x);
            return expandedInfos;
        }

        async Task<IEnumerable<TemplateInfo>> FetchParentTemplates(TemplateInfo info)
        {
            if (!GetExtendsRegex.IsMatch(info.scrubbedContent)) return new List<TemplateInfo> { info }; // base case
            var parents = await GetParentInfos(_pathProvider, info.key, _contentRetriever);
            var allTemplateInfos = new List<TemplateInfo> { info }.Concat(parents);
            _logger.Info(string.Format("inheritance chain for {0}: {1}", info.ToString(), string.Join(", ", allTemplateInfos.Select(y => y.ToString()))));
            return TransformAndMapTemplates(allTemplateInfos); // else have to fetch and merge in all the parents
        }

        async Task<TemplateInfo> RetrieveTemplateContent(ThemeFileSystemInfo info)
        {
            return new TemplateInfo
            {
                key = ScrubVirtualPath(info.VirtualPathNoExt),
                scrubbedContent = await _contentRetriever.GetContentAsync(info),
                themeId = info.ThemeId
            };
        }

        static IEnumerable<TemplateInfo> TransformAndMapTemplates(IEnumerable<TemplateInfo> allTemplateInfos)
        {
            // because every list that is passed into here should have a parent.
            Debug.Assert(allTemplateInfos.Count() > 1);

            var head = allTemplateInfos.First();
            var next = allTemplateInfos.Skip(1).First();
            var newExtendsPath = MakeExtendsPath(GetExtendsRegex.Match(head.scrubbedContent).Groups["path"].Value, next.themeId);
            head.scrubbedContent = TransformContent(head.scrubbedContent, newExtendsPath);
            next.key = newExtendsPath;

            if (allTemplateInfos.Count() == 2) // base case
            {
                return new List<TemplateInfo> { head, next };
            }

            var others = new List<TemplateInfo> { next }.Concat(allTemplateInfos.Skip(2)); // mutated 'next' plus remainder of list
            return new List<TemplateInfo> { head }.Concat(TransformAndMapTemplates(others));
        }

        static string ScrubVirtualPath(string vp)
        {
            return vp.Replace('\\', '/').Replace("templates/", "");
        }

        static string TransformContent(string content, string newExtendsPath)
        {
            var replaceString = CreateFullReplaceString(content);
            var newString = string.Format("\"{0}\"", newExtendsPath);
            var extendsTagReplaced = content.Replace(replaceString, newString);
            return ScrubCommentsFromTemplate(extendsTagReplaced);
        }

        static string MakeExtendsPath(string basePath, string themeId)
        {
            var interimExtendsPath = string.Format("{0}__{1}", basePath.Replace("\"", string.Empty).Replace("'", string.Empty).Replace("\\", "/"), themeId);
            return ScrubVirtualPath(interimExtendsPath);
        }

        static string CreateFullReplaceString(string content)
        {
            var m = GetExtendsRegex.Match(content);
            var pathPart = m.Groups["path"].Value;
            var junkPart = m.Groups["junk"].Value;
            var filterPart = m.Groups["filter"].Value;
            var all = string.Format("{0}{1}{2}", pathPart, junkPart, filterPart);
            return all;
        }

        static readonly Regex GetExtendsRegex = new Regex(@"{%(?:\s*)extends(?:\s*)(?<path>"".*""|'.*')(?<junk>(?:\s*)\|(?:\s*))(?<filter>parent_template)(?:\s*)%}", RegexOptions.Compiled);

        /// <summary>
        /// Walks the inheritance tree for a virtual path and returns an ordered list of the parent theme files for the same virtual path.
        /// </summary>
        /// <param name="vpp"></param>
        /// <param name="virtualPath"></param>
        /// <returns></returns>
        static async Task<IEnumerable<TemplateInfo>> GetParentInfos(IMozuVirtualPathProvider vpp, string virtualPath, IThemeContentRetriever contentRetriever)
        {

            var theme = vpp.GetThemeFileInfo(string.Format("templates/{0}", virtualPath), false);
            if (theme == null) return Enumerable.Empty<TemplateInfo>();

            var parents = new List<ThemeFileSystemInfo>();
            var parent = vpp.GetParentThemeFileInfo(theme);
            while (parent != null)
            {
                parents.Add(parent);
                parent = vpp.GetParentThemeFileInfo(parent);
            }

            var getContentTasks = parents.Select(async x => new TemplateInfo
            {
                key = ScrubVirtualPath(x.VirtualPathNoExt),
                themeId = x.ThemeId,
                scrubbedContent = await contentRetriever.GetContentAsync(x)
            });

            await Task.WhenAll(getContentTasks);

            return getContentTasks.Select(x => x.Result);
        }

        static readonly Regex HtmlCommentRegex = new Regex("<!--.*-->", RegexOptions.Compiled); // removes everything from <!-- through -->
        static readonly Regex HyprCommentRegex = new Regex(@"\{#.*#\}", RegexOptions.Compiled); // removes everything from {# through #}. note that the curlies have to be escaped.
        static readonly IEnumerable<Regex> TemplateScrubbers = new List<Regex>
        {
            HtmlCommentRegex,
            HyprCommentRegex,
        };

        static string ScrubCommentsFromTemplate(string template)
        {
            return TemplateScrubbers.Aggregate(template, (s, regex) => regex.Replace(s, string.Empty));
        }
    }
}