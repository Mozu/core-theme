using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Areas.Misc
{
    public class AMDModuleProvider
    {
        private IMozuVirtualPathProvider PathProvider;
        public AMDModuleProvider(IMozuVirtualPathProvider pathProvider)
        {
            PathProvider = pathProvider;
        }

        private static class ModuleParts
        {
            public const string DEFINE = "define([";
            public const string FUNCTION = "], function(";
            public const string OPEN = ") {\r\n\r\n";
            public const string RETURN = "\r\n; return ";
            public const string CLOSE = ";\r\n\r\n});\r\n\r\n//@sourceUrl=";
            public const string LAST = "\r\n";
            public const string WARNING = "\r\nwindow.console&&console.error&&console.error(\"The script `{0}` was called with the `shim!` plugin, but it may already contain code that defines it as an AMD module.\\n\\nNested `define()` calls can result in race conditions. Check this file to see if the `shim!` is necessary.\");\r\n";
        }

        public string FormatModule(string deps, string args, string contents, string toExport, string path, bool debug)
        {
            using (var container = StringBuilderPool.Default.GetContainer())
            {
                var sb = container.Item;
                sb.Append(ModuleParts.DEFINE);
                sb.Append(deps);
                sb.Append(ModuleParts.FUNCTION);
                sb.Append(args);
                sb.Append(ModuleParts.OPEN);

                if (debug && contents.IndexOf("define.amd") > 0)
                {
                    sb.AppendFormat(ModuleParts.WARNING, path);
                }

                sb.AppendLine(contents);
                sb.Append(ModuleParts.RETURN);
                sb.Append(toExport);
                sb.Append(ModuleParts.CLOSE);
                sb.Append(path);
                sb.Append(ModuleParts.LAST);

                return sb.ToString();
            }
        }

        string GetScriptFileContents(string pathinfo)
        {
            var file = PathProvider.GetThemeFileInfo("scripts/" + pathinfo);
            return file == null ? null : System.IO.File.ReadAllText(file.FullPath);
        }

        private readonly Regex DepNameRE = new Regex("(.+)=([a-zA-Z_$][0-9a-zA-Z_$]*)$");

        private Tuple<string, string> GetAMDDeps(string requireString)
        {
            if (string.IsNullOrEmpty(requireString))
            {
                return new Tuple<string, string>(string.Empty, string.Empty);
            }
            List<string> namedDeps = new List<string>();
            List<string> anonDeps = new List<string>();
            List<string> args = new List<string>();

            //string[] dep;

            int nestingLevel = 0;
            int lastCommaIndex = -1;
            bool isComma = false;
            char chr;
            string depName;
            Match depMatch;
            char[] requireCharArray = requireString.ToCharArray();
            for (int i = 0; i < requireCharArray.Length; i++)
            {
                chr = requireCharArray[i];
                if (chr == '[') nestingLevel++;
                if (chr == ']') nestingLevel--;
                isComma = (chr == ',');
                if (nestingLevel < 0) throw new Exception("Cannot parse AMD dependency array.");
                if ((isComma || i + 1 == requireCharArray.Length) && nestingLevel == 0)
                {
                    depName = requireString.Substring(lastCommaIndex + 1,
                        ((isComma ? i : i + 1) - lastCommaIndex - 1));
                    depMatch = DepNameRE.Match(depName);
                    if (depMatch.Success)
                    {
                        namedDeps.Add("\"" + depMatch.Groups[1].Captures[0].Value + "\"");
                        args.Add(depMatch.Groups[2].Captures[0].Value);
                    }
                    else
                    {
                        anonDeps.Add(depName);
                    }
                    lastCommaIndex = i;
                }
            }


            namedDeps.AddRange(anonDeps);

            return new Tuple<string, string>(string.Join(",", namedDeps.ToArray()), string.Join(",", args.ToArray()));
        }

        public HttpResponseMessage CreateModule(HttpRequestMessage req, string pathinfo, string shimRequire, string shimExport, bool debug)
        {
            string contents = GetScriptFileContents(pathinfo);
            if (contents == null)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound)
                {
                    RequestMessage = req,
                    Content = new StringContent("File " + pathinfo + " not found.")
                };
            }
            Tuple<string, string> deps = GetAMDDeps(shimRequire);
            string module = FormatModule(deps.Item1, deps.Item2, contents, shimExport, "scripts/" + pathinfo, debug);
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                RequestMessage = req,
                Content = new StringContent(module, Encoding.Unicode, "text/javascript")
            };
        }
    }
}