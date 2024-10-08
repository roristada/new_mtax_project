"use client"
import { useState } from "react";
import Compare from "./Compare"
import useAuthEffect from "../../../../lib/useAuthEffect";

export default function ComparePage({ params }: { params: { slug: string } }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  if(!isAuthChecked) return null

  return <Compare slug={params.slug} />
}