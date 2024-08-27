import Compare from "./Compare"

export default function ComparePage({ params }: { params: { slug: string } }) {
  return <Compare slug={params.slug} />
}