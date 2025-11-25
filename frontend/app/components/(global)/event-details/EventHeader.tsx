"use client"

import HoverCard from "@/app/components/(ui)/HoverCard"

interface EventHeaderProps {
  imageUrl: string
}

export default function EventHeader({ imageUrl }: EventHeaderProps) {
  return (
    <HoverCard>
      <div className="relative z-10 h-[200px] w-full md:h-[550px] rounded-2xl overflow-hidden">
        <img
          src={imageUrl}
          alt="Event preview"
          className="w-full h-full object-cover"
        />
      </div>
    </HoverCard>
  )
}