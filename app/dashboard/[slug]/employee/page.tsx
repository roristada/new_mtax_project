"use client";
import { useState } from 'react';
import Employee from './Employee'  // Assuming you move the main component logic to a separate file
import useAuthEffect from '@/lib/useAuthEffect';

export default function EmployeePage({ params }: { params: { slug: string } }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useAuthEffect((authenticated) => {
    setIsAuthChecked(authenticated);
  });

  if(!isAuthChecked) return null

  return <Employee slug={params.slug} />
}