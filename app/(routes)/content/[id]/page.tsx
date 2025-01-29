"use client";

import { useParams } from "next/navigation";
import ContentPage from "@/components/content/ContentPage";

export default function Page() {
  const { id } = useParams();

  return <ContentPage id={id as string} />;
}
