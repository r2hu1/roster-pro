import type { AppHono } from "./index.js"
import { menuRouter } from "./routes/organization/menu/menu.route.js"
import { orderRouter } from "./routes/organization/orders/orders.route.js"
import { organizationRouter } from "./routes/organization/organization.route.js"
import { tableRouter } from "./routes/organization/table/table.route.js"

export function registerRoutes(app: AppHono) {
  app.route("/organization", organizationRouter)
  app.route("/organization/menu", menuRouter)
  app.route("/organization/orders", orderRouter)
  app.route("/organization/table", tableRouter)
}
