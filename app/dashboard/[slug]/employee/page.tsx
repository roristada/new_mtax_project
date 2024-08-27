import Employee from './Employee'  // Assuming you move the main component logic to a separate file

export default function EmployeePage({ params }: { params: { slug: string } }) {
  return <Employee slug={params.slug} />
}