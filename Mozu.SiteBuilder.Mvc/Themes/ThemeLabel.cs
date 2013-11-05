using System;
using System.Collections;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public class ThemeLabelCollection : IEnumerable<ThemeLabel>
    {
        private Dictionary<string, ThemeLabel> _labels = new Dictionary<string, ThemeLabel>(StringComparer.OrdinalIgnoreCase);

        public bool Contains(string labelId)
        {
            return _labels.ContainsKey(labelId);
        }

        public void Add(ThemeLabel label)
        {
            if (Contains(label.Id))
                throw new InvalidOperationException("Key already exists: " + label.Id);
            _labels.Add(label.Id, label);
        }

        public ThemeLabel this[string labelId] { get { return _labels[labelId]; } }

        public IEnumerator<ThemeLabel> GetEnumerator()
        {
            return _labels.Values.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _labels.Values.GetEnumerator();
        }

        public void AddRange(IEnumerable<ThemeLabel> labels)
        {
            foreach (var label in labels)
                this.Add(label);
        }
    }


    public class ThemeLabel
    {
        public string Id { get; set; }
        public string Value { get; set; }
        internal string DeclaredInFile { get; set; }
    }
}
