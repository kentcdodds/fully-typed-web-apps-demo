import type { LoaderArgs, ActionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react"
import type { ErrorMessages, FormValidations } from "remix-validity-state"
import {
  Field,
  FormContextProvider,
  validateServerFormData,
} from "remix-validity-state"
import { prisma } from "~/db.server"
import invariant from "tiny-invariant"

export async function loader({ params }: LoaderArgs) {
  const { workshopId } = params
  invariant(workshopId, "Missing workshopId")
  const workshop = await prisma.workshop.findFirst({
    where: { id: workshopId },
    select: { id: true, title: true, description: true, date: true },
  })
  if (!workshop) {
    // handled by the CatchBoundary
    throw new Response("Not found", { status: 404 })
  }
  return json({ workshop })
}

const formValidations: FormValidations = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 40,
  },
  description: {
    required: true,
    minLength: 2,
    maxLength: 1000,
  },
}

const errorMessages: ErrorMessages = {
  tooShort: (minLength, name) =>
    `The ${name} field must be at least ${minLength} characters`,
  tooLong: (maxLength, name) =>
    `The ${name} field must be less than ${maxLength} characters`,
}

export async function action({ request, params }: ActionArgs) {
  const { workshopId } = params
  invariant(workshopId, "Missing workshopId")
  const formData = await request.formData()
  const serverFormInfo = await validateServerFormData(formData, formValidations)
  if (!serverFormInfo.valid) {
    return json({ serverFormInfo }, { status: 400 })
  }
  const { title, description } = serverFormInfo.submittedFormData
  const workshop = await prisma.workshop.update({
    where: { id: workshopId },
    data: { title, description },
    select: { id: true },
  })
  return redirect(`/workshops/${workshop.id}`)
}

export default function WorkshopRoute() {
  const { workshop } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div>
      <Form method="post">
        <FormContextProvider
          value={{
            formValidations,
            errorMessages,
            serverFormInfo: actionData?.serverFormInfo,
          }}
        >
          <Field name="title" label="Title" defaultValue={workshop.title} />
          <Field
            name="description"
            label="Description"
            defaultValue={workshop.description}
          />
        </FormContextProvider>
        <button type="submit">Submit</button>
      </Form>
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
