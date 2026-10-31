import { renderIncidentImage } from "@/components/IncidentOpenGraphImage"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  return renderIncidentImage(slug)
}
