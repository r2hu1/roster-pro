import type { AppHono } from "./index.js"
import { analyticsRouter } from "./routes/organization/analytics/analytics.route.js"
import { menuItemRouter } from "./routes/organization/menu/menu-item/menu-item.route.js"
import { menuRouter } from "./routes/organization/menu/menu.route.js"
import { orderRouter } from "./routes/organization/orders/orders.route.js"
import { organizationRouter } from "./routes/organization/organization.route.js"
import { tableRouter } from "./routes/organization/table/table.route.js"
import { userRouter } from "./routes/user/user.route.js"

export function registerRoutes(app: AppHono) {
  app.route("/organization", organizationRouter)
  app.route("/organization/analytics", analyticsRouter)
  app.route("/organization/menu", menuRouter)
  app.route("/organization/menu/item", menuItemRouter)
  app.route("/organization/orders", orderRouter)
  app.route("/organization/table", tableRouter)
  app.route("/user", userRouter)
}
