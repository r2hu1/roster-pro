import Footer from "@/components/footer"
import Header from "@/components/header"
import { CartProvider } from "@/modules/cart/views/provider/cart-provider"
import { OrdersStreamProvider } from "@/modules/orders/views/providers/orders-stream"
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
          <OrdersStreamProvider>
            <main>
              <Header />
              {children}
              <Footer />
              <Toaster
                position="top-center"
                className="toaster group z-9999!"
                toastOptions={{
                  classNames: {
                    toast:
                      "p-3! rounded-xl! px-4! group toast group-[.toaster]:bg-foreground! group-[.toaster]:text-background! group-[.toaster]:border-0! group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    icon: "size-4! mr-2!",
                  },
                }}
                duration={1000}
              />
            </main>
          </OrdersStreamProvider>
        </CartProvider>
      </TableProvider>
    </ReactQueryProvider>
  )
}
