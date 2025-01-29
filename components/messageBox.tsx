import React from 'react'
import { Card, CardContent } from './ui/card'
import { cn } from '@/lib/utils'
import Markdown from './markdown'

type Props = {
    role: string,
    content: string,
}

const MessageBox = ({ role, content }: Props) => {
  const isUser = role === 'user'
  
  return (
    <div className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}>
      <Card className={cn(
        "max-w-[80%]",
        isUser ? "bg-black text-white" : "bg-white text-black"
      )}>
        <CardContent className='p-4 bg-white text-black dark:bg-gray-900 dark:text-white rounded-lg border text-sm'>
          <Markdown content={content} />
        </CardContent>
      </Card>
    </div>
  )
}

export default MessageBox