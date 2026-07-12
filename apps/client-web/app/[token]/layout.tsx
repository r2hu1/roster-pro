import Footer from "@/components/footer"
import Header from "@/components/header"
import { CartProvider } from "@/modules/providers/cart-provider"
import { ReactQueryProvider } from "@/modules/providers/query-client"
import { TableProvider } from "@/modules/providers/table-provider"
import { Toaster } from "sonner"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ token: string }>
}) => {
  const { token } = await params
  try {
    const req = await fetch(
      `${process.env.API_URL}/v1/organization/table/token/decode?token=${token}`
    )
    const data = await req.json()

    return {
      title: {
        default: `${data.data.organization.name}`,
        template: `${data.data.organization.name} | %s`,
      },
      description: `${data.data.organization.address}`,
      icons: [data.data.organization.logo],
    }
  } catch {
    return {
      title: "An error occurred",
      description: "An error occurred while fetching the organization data.",
      icons: ["/assets/roster-pro-logo.jpeg"],
    }
  }
}

export interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ReactQueryProvider>
      <TableProvider>
        <CartProvider>
        <main>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </main>
        </CartProvider>
      </TableProvider>
    </ReactQueryProvider>
  )
}
