using dotless.Core.Exceptions;
using dotless.Core.Importers;
using dotless.Core.Input;
using dotless.Core.Loggers;
using dotless.Core.Parser;
using dotless.Core.Parser.Infrastructure;
using dotless.Core.Parser.Infrastructure.Nodes;
using dotless.Core.Parser.Tree;
using dotless.Core.Plugins;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Areas.Misc
{
    public class LessLogger : ILogger
    {
        private static string DebugTemplate = "DEBUG: {0}";
        private static string ErrorTemplate = "ERROR: {0}";
        private static string InfoTemplate = "INFO: {0}";
        private static string LogTemplate = "LOG LEVEL {0}: {1}";
        private static string WarnTemplate = "WARNING: {0}";

        public void Debug(string msg)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(DebugTemplate, msg));
        }

        public void Error(string msg)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(ErrorTemplate, msg));
        }

        public void Info(string msg)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(InfoTemplate, msg));
        }

        public void Log(LogLevel level, string msg)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(LogTemplate, level.ToString(), msg));
        }

        public void Warn(string msg)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(WarnTemplate, msg));
        }


        public void Debug(string message, params object[] args)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(DebugTemplate, string.Join(" -- ", args)));
        }

        public void Error(string message, params object[] args)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(ErrorTemplate, string.Join(" -- ", args)));
        }

        public void Info(string message, params object[] args)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(InfoTemplate, string.Join(" -- ", args)));
        }

        public void Warn(string message, params object[] args)
        {
            System.Diagnostics.Debug.WriteLine(String.Format(WarnTemplate, string.Join(" -- ", args)));
        }
    }

    public class LessTransFormer
    {
        static readonly Regex g_regex =
            new Regex(@"\{\{[\s]*(?<col>[\w]+)\.(?<var>[\w-]+)(?<filters>(?:\|\w+(?:\:[^\|\}]+)?)*)[\s]*\}\}",
                                                          RegexOptions.IgnoreCase |
                                                          RegexOptions.Compiled |
                                                          RegexOptions.Singleline |
                                                          RegexOptions.IgnorePatternWhitespace);

        private readonly bool _debug;
        private readonly bool _emitDebugStylesheet;
        private readonly IThemeContentRetriever _contentRetriever;
        private readonly string _path;

        public LessTransFormer(string path, bool debug, bool emitDebugStylesheet, ResourceController resourceController,
            IMozuVirtualPathProvider virtualPathProvider, IThemeContentRetriever contentRetriever)
        {
            Controller = resourceController;
            _emitDebugStylesheet = emitDebugStylesheet;
            _debug = debug;
            _contentRetriever = contentRetriever;
            _path = path;
            PathProvider = virtualPathProvider;
        }


        public ResourceController Controller { get; set; }
        public IMozuVirtualPathProvider PathProvider { get; set; }

        public Stream Transform(Stream str, string stem)
        {
            var sr = new StreamReader(str);
            string template = sr.ReadToEnd();
            Exception debuggableException = null;

            template = ProcessSettingsVariables(template, stem);
            var reader = new MyLessFileReader(this, _contentRetriever);


            var parser = new Parser
            {
                Importer = new Importer(reader, true, false, false)
            };

            Ruleset tree = null;
            try
            {
                tree = parser.Parse(template, _path);
            }
            catch (FileNotFoundException exception)
            {
                throw new FileNotFoundException(exception.Message + "[" + exception.FileName + "]", exception.InnerException);
            }
            catch (Exception ex)
            {
                if (_debug && _emitDebugStylesheet)
                {
                    debuggableException = ex;
                }
                else throw;
            }




            var env = new Env { Compress = !_debug, Debug = _debug };


            var mlp = new ProbeForThemeVariablesPlugin()
            {
                ThemeSettings = Controller.SiteContext.ThemeSettings,
                CdnPrefix = Controller.SiteContext.CdnPrefix
            };
            env.AddPlugin(mlp);

            env.AddPlugin(new InsertThemeVariablePlugin()
            {
                Rules = mlp.Rules
            });
            env.AddFunction("cdnurl", typeof(CdnFunction));

            try
            {
                env.Output.Push().Append(tree);
            }
            catch (Exception ex)
            {

                if (_debug && _emitDebugStylesheet)
                {
                    debuggableException = ex;
                }

                else if (ex.GetType().FullName.Contains("dotless"))
                {
                    throw;
                }
                else
                {
                    throw new Exception("error parsing LESS file " + _path, ex);
                }
            }

            MemoryStream ms;
            using (var container = StringBuilderPool.Default.GetContainer())
            {
                StringBuilder sb;
                if (debuggableException != null)
                {
                    sb = container.Item;
                    sb.Append(VISIBLE_LESS_ERROR_FILE_START);
                    sb.Append(debuggableException.Message.Replace(System.Environment.NewLine, "\\a ").Replace("\'", "\\'"));
                    sb.Append(VISIBLE_LESS_ERROR_FILE_END);
                }
                else
                {
                    sb = env.Output.Pop();
                }
                ms = new MemoryStream(Encoding.UTF8.GetBytes(sb.ToString()));
            }
            ms.Position = 0;
            return ms;
        }
        public string ProcessSettingsVariables(string template, string fileName)
        {
            if (template.IndexOf("{{") > -0)
            {
                try
                {
                    return g_regex.Replace(template, Evaluator);
                }
                catch (ParsingException par)
                {
                    par.Location.FileName = fileName;
                    par.Location.Source = template;
                    throw;
                }
            }

            return template;
        }

        private string Evaluator(Match match)
        {
            var varName = match.Groups["var"].Value;
            var obj = Controller.SiteContext.ThemeSettings[varName];
            if (obj == null)
            {
                throw new ParsingException("missing template setting '" + varName + "'",
                    new NodeLocation(match.Index, "", ""));
            }
            //var str = obj.ToString();
            //if (string.IsNullOrEmpty(str))
            //{
            //    throw new ParsingException("empty template setting '" + varName + "'",
            //        new NodeLocation(match.Index, "", ""));
            //}
            //return str;

            return obj.ToString() ?? string.Empty;
        }

        public const string VISIBLE_LESS_ERROR_FILE_START = @"
                body > * {
                    opacity: 0.1;
                }
                body:before {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    padding: 20px 30px;
                    font-size: 2em;
                    color: white;
                    background: red;
                    font-family: monospace;
                    font-weight: bold;
                    content: 'There was an error parsing your Less stylesheet.'
                }
                body:after { 
                    position: fixed; 
                    top: 50px;
                    left: 0;
                    color: red;
                    margin: 30px;
                    font-weight: bold;
                    font-family: monospace;
                    line-height: 1.5em;
                    font-size: 1.2em;
                    white-space: pre;
                    white-space: pre-wrap;
                    content: '";
        public const string VISIBLE_LESS_ERROR_FILE_END = @"'; 
                }";
    }

    class MyLessFileReader : IFileReader
    {
        private readonly LessTransFormer _lessTransFormer;
        private readonly IThemeContentRetriever _contentRetriever;

        public MyLessFileReader(LessTransFormer lessTransFormer, IThemeContentRetriever contentRetriever)
        {
            _lessTransFormer = lessTransFormer;
            _contentRetriever = contentRetriever;
            Controller = lessTransFormer.Controller;
        }

        private static string g_content = "/*.nullcontainerguything {}*/";
        private ResourceController Controller { get; set; }

        public string GetFileContents(string fileName)
        {
            var transFormedContent = string.Empty;
            {
                var stem = fileName;
                var file = _lessTransFormer.PathProvider.GetThemeFileInfo(stem);
                if (file != null)
                {
                    transFormedContent = _lessTransFormer.ProcessSettingsVariables(_contentRetriever.GetContent(file), file.VirtualPath);
                }
            }
            return string.IsNullOrWhiteSpace(transFormedContent) ? g_content : transFormedContent;
        }

        public bool DoesFileExist(string fileName)
        {
            string stem = fileName;
            var file = _lessTransFormer.PathProvider.GetThemeFileInfo(stem);
            return file != null;
        }


        public byte[] GetBinaryFileContents(string fileName)
        {
            // foreach (var theme in SiteContext.ThemeInfo.Stack)
            {
                string stem = fileName;
                var file = _lessTransFormer.PathProvider.GetThemeFileInfo(stem);
                if (file != null)
                {
                    using (Stream stream = _contentRetriever.GetStream(file))
                    {
                        var data = new byte[stream.Length];
                        stream.Read(data, 0, data.Length);
                        return data;
                    }
                }
            }

            return null;
        }


        public bool UseCacheDependencies
        {
            get { return false; }
        }
    }

    class CdnFunction : dotless.Core.Parser.Functions.Function
    {

        protected override Node Evaluate(Env env)
        {
            string inner;
            var tn = Arguments[0] as TextNode;
            if (tn == null)
            {
                inner = Arguments[0].ToCSS(env);
            }
            else
            {

                inner = tn.Value;
            }






            var imagePath = inner;
            if (!inner.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var cndPrefix = env.VisitorPlugins.OfType<ProbeForThemeVariablesPlugin>().First().CdnPrefix ?? "";
                if (!cndPrefix.EndsWith("/"))
                {
                    cndPrefix += "/";
                }
                imagePath = cndPrefix + inner;
            }


            return new TextNode("url(\"" + imagePath + "\")");


        }
    }

    class InsertThemeVariablePlugin : VisitorPlugin
    {
        public override VisitorPluginType AppliesTo
        {
            get { return VisitorPluginType.BeforeEvaluation; }
        }
        public Dictionary<string, Node> Rules = new Dictionary<string, Node>();

        public override Node Execute(Node node, out bool visitDeeper)
        {
            visitDeeper = true;

            var root = node as Root;
            if (root != null && this.Rules.Count > 0)
            {
                root.Rules.InsertRange(0, Rules.Values);
                this.Rules.Clear();
                visitDeeper = false;
            }


            return node;
        }
    }

    class ProbeForThemeVariablesPlugin : VisitorPlugin
    {
        public override VisitorPluginType AppliesTo
        {
            get { return VisitorPluginType.BeforeEvaluation; }
        }

        public Env Env { get; set; }
        public Dictionary<string, Node> Rules = new Dictionary<string, Node>();
        const string prefix = "@theme-settings-";


        public ThemeRuntimeSettingsCollection ThemeSettings { get; set; }
        public string CdnPrefix { get; set; }
        public override Node Execute(Node node, out bool visitDeeper)
        {

            var variableNode = node as Variable;
            visitDeeper = true;
            if (variableNode != null)
            {
                if (variableNode.Name.IndexOf(prefix, StringComparison.OrdinalIgnoreCase) == 0 && !Rules.ContainsKey(variableNode.Name))
                {

                    var setting = ThemeSettings[variableNode.Name.Substring(prefix.Length)];
                    bool added = false;
                    if (setting != null)
                    {
                        Parser p = new Parser();
                        var val = variableNode.Name + ":" + setting.ToString() + ";";
                        try
                        {
                            var ruleSet = p.Parse(val, "c:\\themesettingVariables.less");

                            Rules.Add(variableNode.Name, ruleSet.Rules.First());
                        }
                        catch
                        {
                            val = variableNode.Name + ":\"" + setting.ToString() + "\";";

                            try
                            {
                                var ruleSet = p.Parse(val, "c:\\themesettingVariables.less");
                                Rules.Add(variableNode.Name, ruleSet.Rules.First());
                            }
                            catch
                            {
                            }
                        }

                        added = true;
                    }
                }
                visitDeeper = false;

            }


            return node;
        }
    }
}