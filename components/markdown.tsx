import React from 'react'
import markdownit from "markdown-it"
import DOMPurify from 'dompurify';

const md = markdownit({
  html: true
});

// Add custom rule for timestamps
md.inline.ruler.push('timestamp', (state, silent) => {
  const regex = /\[(\d{2}:\d{2})\]/;
  const match = regex.exec(state.src.slice(state.pos));
  
  if (!match) return false;
  if (!silent) {
    const timestamp = match[1];
    const token = state.push('html_inline', '', 0);
    token.content = `<button class="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm hover:bg-primary/20 transition-colors" data-timestamp="${timestamp}">${timestamp}</button>`;
  }
  
  state.pos += match[0].length;
  return true;
});

type Props = {
  content: string;
  onTimestampClick?: (timestamp: string) => void;
}

const Markdown = ({ content, onTimestampClick }: Props) => {

  const html = md.render(content);
  const purifiedHtml = DOMPurify.sanitize(html);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.dataset.timestamp) {
      onTimestampClick?.(target.dataset.timestamp);
    }
  };

  return (
    <div 
      onClick={handleClick}
      dangerouslySetInnerHTML={{__html: purifiedHtml}}
    />
  )
}

export default Markdown