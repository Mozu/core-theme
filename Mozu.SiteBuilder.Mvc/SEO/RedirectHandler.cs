using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface IRedirectHandler
    {
        RedirectEntry GetRedirectForRequestUri(IRedirectRepository repo, Uri requestUri);
    }

    public class RedirectHandler : IRedirectHandler
    {
        public static readonly IRedirectHandler Instance = new RedirectHandler();
        private RedirectHandler() { }
        public RedirectEntry GetRedirectForRequestUri(IRedirectRepository repo, Uri requestUri)
        {
            var redirects = repo.GetRuntimeRedirectEntries();
            if (redirects == null || redirects.Simple == null)
            {
                return null;
            }

            var stem = requestUri.AbsolutePath.TrimStart('/');
            var queryString = requestUri.ParseQueryString();
            var redir = FindRedirectForRequestUri(redirects, stem, queryString);
            if (redir == null)
            {
                return null;
            }
            var destination = ProcessQS(queryString, redir.Destination, redir.CopyQueryString);

            return new RedirectEntry()
            {
                Source = redir.Source,
                Destination = destination,
                IsRewrite = redir.IsRewrite,
                IsTemporary = redir.IsTemporary
            };
        }

        static RedirectEntry FindRedirectForRequestUri(RuntimeRedirects redirects, string stem, NameValueCollection queryString)
        {
            if (redirects.Simple.TryGetValue(stem, out var redir))
            {
                return redir;
            }

            if (!redirects.QueryString.TryGetValue(stem, out var qsRedirectEntries))
            {
                // var wildCardMatches = new List<RedirectEntry>();
                return MatchWildCards(redirects, stem, queryString);
            }

            var matchingRedirect =
                qsRedirectEntries
                .FirstOrDefault(redirectEntry => MatchesRequest(redirectEntry.Query, queryString));

            return matchingRedirect?.Redirect;
        }

        private static RedirectEntry MatchWildCards(RuntimeRedirects redirects, string stem, NameValueCollection queryString)
        {
            if (redirects.WildCards == null)
            {
                return null;
            }
            foreach (var indexedMatches in redirects.WildCards)
            {
                if (indexedMatches.Item1 > stem.Length)
                {
                    continue;
                }
                var pos = indexedMatches.Item1;
                var segmentToMatch = stem.Substring(0, pos);
                List<RuntimeRedirectEntry> candidates;
                if (!indexedMatches.Item2.TryGetValue(segmentToMatch, out candidates))
                {
                    continue;
                }
                foreach (var candidate in candidates)
                {
                    pos = indexedMatches.Item1;
                    var isFound = true;
                    if (candidate.AdditionalWildcardSegments?.Any() == true)
                    {
                        foreach (var segment in candidate.AdditionalWildcardSegments)
                        {
                            var nextPos = stem.IndexOf(segment, pos, StringComparison.OrdinalIgnoreCase);
                            if (nextPos == -1)
                            {
                                isFound = false;
                                break;
                            }
                            pos = nextPos + segment.Length;
                        }
                        if (!isFound ||
                            (
                                !candidate.Redirect.Source.EndsWith("*") &&
                                !stem.EndsWith(candidate.AdditionalWildcardSegments.Last(), StringComparison.OrdinalIgnoreCase)
                            ))
                        {
                            continue;
                        }

                    }


                    if (candidate.Query != null)
                    {
                        if (MatchesRequest(candidate.Query, queryString))
                        {
                            return candidate.Redirect;
                        }
                    }
                    else
                    {
                        return candidate.Redirect;
                    }
                }
            }

            return null;
        }


        static bool MatchesRequest(NameValueCollection redirectQuery, NameValueCollection incomingQuery)
        {
            // all keys in the redirect must be present in the incoming request
            if (redirectQuery.AllKeys.Any(key => !incomingQuery.AllKeys.Contains(key, StringComparer.OrdinalIgnoreCase))) return false;

            // all non-wildcard values in the redirect QS must have matching values in the incoming request
            var required = redirectQuery.AllKeys.Where(x => !redirectQuery[x].Equals("*", StringComparison.OrdinalIgnoreCase));
            if (required.Any(key => !incomingQuery.GetValues(key).Contains(redirectQuery[key], StringComparer.OrdinalIgnoreCase))) return false;

            return true;
        }

        static readonly Regex RedirectTokenReplacement = new Regex(@"{(?<token>[^}]+)}",
                RegexOptions.ExplicitCapture |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);


        static string ProcessQS(NameValueCollection queryString, string destinationTemplate, bool? copyQS)
        {
            var expandedTemplate = RedirectTokenReplacement.Replace(destinationTemplate, match =>
            {
                var token = match.Groups["token"].Value;
                var rep = queryString[token];
                if (rep != null)
                {
                    return rep;
                }
                return match.Value;
            });

            var qpos = expandedTemplate.IndexOf('?');
            var stem = qpos > -1 ? expandedTemplate.Substring(0, qpos) : expandedTemplate;
            var query = qpos > -1 ? expandedTemplate.Substring(qpos + 1) : string.Empty;
            var qstring = System.Web.HttpUtility.ParseQueryString(query, System.Text.Encoding.UTF8);

            if (copyQS.GetValueOrDefault(false))
            {
                foreach (string key in queryString.AllKeys.Where(x => queryString[x] != null))
                {
                    qstring[key] = queryString[key];
                }
            }

            string dest = stem;
            if (qstring.Count > 0)
            {
                dest = stem + "?" + qstring.ToString();
            }
            return dest;
        }
    }
}
