import { ComponentType } from "react";
import { COMPANIES_ROUTE, FOODITEMS_ROUTE, FRIDGEINVENTORY_ROUTE, FRIDGES_ROUTE, LOGIN_ROUTE, MAIN_ROUTE, NOTIFICATIONS_ROUTE, ORDERITEMS_ROUTE, ORDERS_ROUTE, USERS_ROUTE, REPORTS_ROUTE, BACKUP_ROUTE, REGISTER_ROUTE, CHART_ROUTE } from "./consts";
import { Companies } from "./pages/Companies";
import { MainPage } from "./pages/MainPage";
import { Login } from "./pages/Login";
import { Fridges } from "./pages/Fridges";
import { FoodItems } from "./pages/FoodItems";
import { FridgeInventories } from "./pages/FridgeInventories";
import { Users } from "./pages/Users";
import { Notifications } from "./pages/Notifications";
import { Orders } from "./pages/Orders";
import { Orderitems } from "./pages/OrderItems";
import ReportsPage from "./pages/ReportsPage";
import BackupPage from "./pages/BackupPage";
import { Register } from "./pages/Register";
import TemperatureChart from "./pages/TemperatureChart"; 

interface RouteData {
    path: string,
    Component: ComponentType,
}

export const applicationRoutes: RouteData[] = [
    { path: MAIN_ROUTE, Component: MainPage },
    { path: COMPANIES_ROUTE, Component: Companies },
    { path: LOGIN_ROUTE, Component: Login },
    { path: FRIDGES_ROUTE, Component: Fridges },
    { path: FOODITEMS_ROUTE, Component: FoodItems },
    { path: FRIDGEINVENTORY_ROUTE, Component: FridgeInventories },
    { path: USERS_ROUTE, Component: Users },
    { path: NOTIFICATIONS_ROUTE, Component: Notifications },
    { path: ORDERS_ROUTE, Component: Orders },
    { path: ORDERITEMS_ROUTE, Component: Orderitems },
    { path: REPORTS_ROUTE, Component: ReportsPage },
    { path: BACKUP_ROUTE, Component: BackupPage },
    { path: REGISTER_ROUTE, Component: Register },
    { path: CHART_ROUTE, Component: TemperatureChart },
]