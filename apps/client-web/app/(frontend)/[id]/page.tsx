"use server"
import MenuPageView from "@/modules/menu/views/ui/menu-page-view"

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params

  try {
    const data = await fetch(
      `${process.env.API_URL}/v1/organization/table/token/decode?token=${id}`
    )
    const decoded = await data.json()

    return {
      title: `${decoded.data.organization.name}`,
      description: `Viewing menu for ${decoded.data.organization.name}`,
      icons: [decoded.data.organization.logo],
      openGraph: {
        title: `${decoded.data.organization.name}`,
        description: `Viewing menu for ${decoded.data.organization.name}`,
        images: [
          {
            url: decoded.data.organization.logo,
            width: 1200,
            height: 675,
          },
        ],
      },
    }
  } catch {
    return {
      title: `Roster Pro`,
      description: `Viewing menu.`,
      icons: [],
      openGraph: {
        title: ``,
        description: ``,
        images: [],
      },
    }
  }
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <MenuPageView id={id} />
}
