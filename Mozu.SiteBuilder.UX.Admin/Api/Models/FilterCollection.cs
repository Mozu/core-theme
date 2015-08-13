using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    public class PagingParamaters
    {
        public string  id {get;set;}
        
        public int? NumericId
        {
            get
            {
                int tmp;
                if (int.TryParse(id, out tmp))
                {
                    return tmp;
                }
                return null;
            }
        }
        public int? pageIndex {get;set;}
        public int? startIndex {get;set;}
        public int? pageSize{get;set;}
        public SortingCollection sort { get; set; }

        public string productCode { get; set; }

        public int SkipAmount
        {
            get
            {
                if (pageIndex.HasValue && pageSize.HasValue) return (pageIndex.Value - 1) * pageSize.Value;
                return 0;
            }
        }
        public override string ToString()
        {
            return this.id + ";" + this.NumericId + ":" + pageIndex + ";" + startIndex + ";" + pageSize + ";" + productCode + ";" + (sort == null ? "" : string.Join(",",sort.Select(x => x.direction + x.property)) );
        }
    }

    public class FilterCollection : List<FilterCollectionItem>
    {
        
        public FilterCollection() : base() { }
        public FilterCollection(IEnumerable<FilterCollectionItem> col)
            : base(col)
        { }
        public string query { get; set; }

        public string SearchType { get; set; }

        public string ShowProductUsages { get; set; }

        public bool ShowVariations { get; set; }

        public bool TryGetValue<T>(string id, out T outValue)
        {
            object val = this.Where(x => string.Equals(x.property, id, StringComparison.OrdinalIgnoreCase)).Select(x => x.value).FirstOrDefault();
            if (val != null)
            {
                if (typeof(T) == typeof(string))
                {
                    outValue=  (T)(object)val.ToString();
                    return true;

                }
                if (typeof(T) == typeof(int))
                {
                    if (val is int)
                    {
                        outValue = (T)val;
                        return true;
                    }
                    int res;
                    if (int.TryParse(val.ToString(), out res))
                    {
                        outValue = (T)(object)res;
                        return true;
                    }

                }
                if (typeof(T) == typeof(bool))
                {
                    if (val is bool)
                    {
                        outValue = (T)val;
                        return true;
                    }
                    bool res;
                    if (bool.TryParse(val.ToString(), out res))
                    {
                        outValue = (T)(object)res;
                        return true;
                    }
                }
                if (typeof(T) == typeof(bool?))
                {
                    if (val is bool)
                    {
                        outValue = (T)val;
                        return true;
                    }
                    bool res;
                    if (bool.TryParse(val.ToString(), out res))
                    {
                        outValue = (T)(object)res;
                        return true;
                    }
                }
            }
            outValue = default(T);
            return false;
        }

        public T GetValue<T>(string id, T defaultValue = default (T))
        {
            T val;
            if (TryGetValue(id, out val))
            {
                return val;
            }
            return defaultValue;
        }

        public T PopValue<T>(string id, T defaultValue = default(T))
        {
            FilterCollectionItem val = this.FirstOrDefault(x => String.Equals(x.property, id, StringComparison.OrdinalIgnoreCase));
            if (val != null)
            {
                this.Remove(val);
                return (T)val.value;
            }
            else
            {
                return defaultValue;
            }
        }

        public bool ContainsProperty(string id)
        {
            return this.Any(f => String.Equals(f.property, id, StringComparison.OrdinalIgnoreCase));
        }

        [System.Diagnostics.DebuggerStepThrough]
        public TVal Get<TEntity, TVal>(Expression<Func<TEntity, TVal>> expression)
        {
            var memberExpression = expression.Body as MemberExpression;
            if (memberExpression == null)
                throw new InvalidOperationException("Expression is not a member");

            var attribute = memberExpression.Member.GetCustomAttributes(typeof(JsonPropertyAttribute), false).Cast<JsonPropertyAttribute>().FirstOrDefault();
            if (attribute == null)
                throw new InvalidOperationException("JsonPropertyAttribute doesn't exist on " + memberExpression.Member.Name);

            var value = this.Where(x => string.Equals(x.property, attribute.PropertyName, StringComparison.OrdinalIgnoreCase)).Select(x => x.value).FirstOrDefault();

            return value == null ? default(TVal) : (TVal) value;
        }

        public System.Collections.Specialized.NameValueCollection QueryString { get; set; }

        public string ResponseGroups { get; set; }

        
    }

    public class SortingCollectionItem
    {
        public string property
        { get; set; }
        public string direction
        {
            get;set;
        }
        public bool IsAscending 
        {
            get{
                return direction != "DESC";
            }
        }
        
    }
    public class SortingCollection : List<SortingCollectionItem>
    {

    }
    public class FilterCollectionItem
    {
        private static Dictionary<string, string> _escapeMap;
          
        static FilterCollectionItem () {
            _escapeMap = new Dictionary<string, string> {
                { "^", "^^"},
                { "'", "^'"},                
                { "\"", "^\""},
                { "[", "^[" },
                { "]", "^]" },
                { "{", "^{" },
                { "}", "^}" },
                { "(", "^(" },
                { ")", "^)" }
            };
        }
        
        // need to escape the following characters:
        // Special Characters: = '^', '\'', '"', '{','}',')','(' 
        // Used as delimiters within expressions
        // source: http://tfs.corp.volusion.com:8080/tfs/VNext/v2Mozu/_git/Mozu.Core#path=%2FMozu.Core.FilterParsing%2FFilterParser.cs&version=GBmaster&_a=contents
        public string EscapeFilter(string stringValue)
        {
            if (stringValue != null)
            {
                foreach (KeyValuePair<string, string> pair in _escapeMap)
                {
                    stringValue = stringValue.Replace(pair.Key.ToString(), pair.Value.ToString());
                }
            }

            return stringValue;
        }
        public FilterCollectionItem ()
        {
            comparison = "eq";
        }
        public string property
        { get; set; }

        public object  value
        {
            get;set;
        }

        public object escapedValue
        {
            get 
            {
                // need to escape the following characters:
                // Special Characters: = '^', '\'', '"', '{','}',')','(' 
                // Used as delimiters within expressions
                // source: http://tfs.corp.volusion.com:8080/tfs/VNext/v2Mozu/_git/Mozu.Core#path=%2FMozu.Core.FilterParsing%2FFilterParser.cs&version=GBmaster&_a=contents
                //var stringValue = this.value as string;
                var stringValue = "";

                if (this.value != null)
                {
                    stringValue = this.value.ToString();
                    stringValue = this.EscapeFilter(stringValue);
                }

                return stringValue;
            }
        }
        public string field
        {
            get { return this.property; }
            set { this.property = value; }
        }
        public string type
        {
            get;
            set;
        }
        public string comparison
        {
            get;
            set;
        }
    }
}