def sub(html: str, tag: str, repl: str):
    """Update tag-delimited content in a markdown file."""
    start_tag = f'<!--{tag}-->'
    end_tag = f'<!--/{tag}-->'
    start_pos = html.index(start_tag) + len(start_tag)
    end_pos = html.index(end_tag)
    return html[:start_pos] + repl + html[end_pos:]
