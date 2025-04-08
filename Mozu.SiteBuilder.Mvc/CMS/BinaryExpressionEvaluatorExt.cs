using Mozu.Core.Expressions;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public static class BinaryExpressionEvaluatorExt
    {
        //todo: might want to convert this to a real class so we can inject things like logging...
        public static async Task EvaluatePageRules(this IExpressionEvaluator<CmsPageRuleContext> evaluator, PageContext pageContext, ExpressionEvaluatorVisitor<CmsPageRuleContext> visitor)
        {
            if (evaluator == null)
            {
                throw new ArgumentNullException(nameof(evaluator));
            }

            if (pageContext == null)
            {
                throw new ArgumentNullException(nameof(pageContext));
            }

            if (visitor == null)
            {
                throw new ArgumentNullException(nameof(visitor));
            }

            var variations = pageContext.CmsContext?.Page?.Document?.Get<JObject[]>("variations");
            if (variations == null) return;

            var validPages = new List<Tuple<int?, JObject>>();
            foreach (var variation in variations)
            {
                variation.TryGetValue("isDisabled", StringComparison.OrdinalIgnoreCase, out var isDisabled);

                if (isDisabled != null && isDisabled.Value<bool>()) continue;
                
                variation.TryGetValue("properties", StringComparison.OrdinalIgnoreCase, out var varProps);
                var variationProps = varProps.ToJObject();

                if (variationProps == null) continue;
                
                variationProps.TryGetValue("variation_rule", StringComparison.OrdinalIgnoreCase, out var rule);
                variationProps.TryGetValue("rank", StringComparison.OrdinalIgnoreCase, out var rank);

                if ( rule == null) continue;

                rule.ToJObject().TryGetValue("expressions", StringComparison.OrdinalIgnoreCase, out var expressions);
                
                if(expressions == null) continue;
                
                var stringRule = rule.ToString();
                var abstractExp = JsonConvert.DeserializeObject<AbstractExpression>(stringRule);
                var pageRuleContext = GetPageRuleContext(pageContext);
                await evaluator.Evaluate(abstractExp, visitor, pageRuleContext);

                if(rank?.Value<int?>() == null)
                    rank = new JValue((int?)1);

                if (visitor.Results.Result)
                    validPages.Add(new Tuple<int?, JObject>(rank.Value<int?>(),variation));
            }

            if (validPages.IsNullOrEmpty())
            {
                return;
            }

            var ordered = validPages.OrderByDescending(x => x.Item1).ToList();
            ordered[0].Item2.TryGetValue("properties", StringComparison.OrdinalIgnoreCase, out var retValue);
            pageContext.CmsContext.Page.Document.Properties = retValue.ToJObject();
        }

        private static CmsPageRuleContext GetPageRuleContext(PageContext pageContext)
        {
                var retVal = new CmsPageRuleContext();
                if (pageContext == null) return retVal;

                if (pageContext.DataViewMode == DataViewModeType.Pending)
                {
                    retVal.StartDate = pageContext.Now;
                    retVal.EndDate = pageContext.Now;
                }
                else
                {
                    retVal.StartDate = DateTime.UtcNow;
                    retVal.EndDate = DateTime.UtcNow;
                }

                retVal.Customer.CustomerSegments = pageContext.User?.Segments;

                return retVal;
        }
    }
}