# Fixes issues in the exported-from-Obsidian json, before you import it into Tiddlywiki.
import re
INFILE = "C:/temp/exported.json"
OUTFILE = "C:/temp/repaired.json"

text_file = open(INFILE, "r", encoding="utf-8")
s = text_file.read()
text_file.close()

# Caution: Newlines in the JSON are represented as two characters: a backslash and an 'n'.
# You can't use ^ or $ because there are no "lines".

# Need to handle [[Visible Name|file-in-local-dir]]
# Hard to tell that from [[Visible Name|Internal-Page-Name]]
# The only way I can think of is to watch for ".pdf]]" or ".PDF]]".
s = re.sub(r"\[\[(.*)\|(.*\.pdf)\]\]", r"[[\1|file:\2]]", s, flags=re.IGNORECASE)

# Rewrite external links and "external" file links.
s = re.sub(r"([^\[])\[([^\[].+?)\]\((http.+?)\)", r"\1[[\2|\3]]", s)
s = re.sub(r"([^\[])\[([^\[].+?)\]\((file.+?)\)", r"\1[[\2|\3]]", s)

# Ensure a blank line before !!!! headings
s = re.sub(r"(\S?)\s*?\\n!", r"\1\\n\\n!", s)

# Ensure a blank line before a bullet list
s = re.sub(r"(\S?)\s*?\\n\*", r"\1\\n\\n*", s)

# Re-write bullets from "    *" to "**"
s = re.sub(r"\\n    \*", r"\\n**", s)
s = re.sub(r"\\n        \*", r"\\n***", s)
s = re.sub(r"\\n            \*", r"\\n****", s)
s = re.sub(r"\\n                \*", r"\\n*****", s)
s = re.sub(r"\\n                    \*", r"\\n******", s)

# Remove Markdown table-header rows. Ideally, we'd add exclamation points on the prior line to mark table headers, but that's too hard.
## BUG: THis broke "Flexible Retirement Planner - Page 2 Data".
#s = re.sub(r"\\n[| -]+\\n", r"\\n", s)

text_file = open(OUTFILE, "w", encoding="utf-8")
text_file.write(s)
text_file.close()
