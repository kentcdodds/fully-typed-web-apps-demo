import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useCatch, useLoaderData, useParams } from "@remix-run/react"
import { route } from "routes-gen"
import { prisma } from "~/db.server"

export async function loader({ params }: LoaderArgs) {
  const workshop = await prisma.workshop.findFirst({
    where: { id: params.workshopId },
    select: { id: true, title: true, description: true, price: true },
  })
  if (!workshop) {
    throw new Response("Not found", { status: 404 })
  }
  return json({ workshop })
}

export default function WorkshopRoute() {
  const { workshop } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>{workshop.title}</h1>
      <p>{workshop.description}</p>
      <p>{workshop.price}</p>
      <Link
        to={route("/workshops/:workshopId/edit", { workshopId: workshop.id })}
      >
        Edit
      </Link>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const params = useParams()

  if (caught.status === 404) {
    return <div>No workshop with the ID {params.workshopId} exists.</div>
  }

  // handled by the ErrorBoundary
  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}
