import React, { useState } from 'react'
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
    const citationNumber = state.env.citationCount = (state.env.citationCount || 0) + 1;
    const token = state.push('html_inline', '', 0);
    token.content = `<button class="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/50 hover:bg-primary/80 transition-colors text-xs font-medium text-white group" data-timestamp="${timestamp}">${citationNumber}<span class="absolute hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">${timestamp}</span></button>`;
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
  const [clickedTimestamp, setClickedTimestamp] = useState<string>("0:00"); 

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.dataset.timestamp) {
      onTimestampClick?.(target.dataset.timestamp);
    }

    setClickedTimestamp(target.dataset.timestamp!) 
  };
  
  console.log(clickedTimestamp);
  return (
    <div 
      onClick={handleClick}
      dangerouslySetInnerHTML={{__html: purifiedHtml}}
    />
  )
}

export default Markdown