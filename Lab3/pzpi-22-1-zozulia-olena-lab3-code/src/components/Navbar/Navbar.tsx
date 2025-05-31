import React, { ReactNode, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  COMPANIES_ROUTE, FOODITEMS_ROUTE, FRIDGEINVENTORY_ROUTE, FRIDGES_ROUTE,
  LOGIN_ROUTE, MAIN_ROUTE, NOTIFICATIONS_ROUTE, ORDERITEMS_ROUTE,
  ORDERS_ROUTE, USERS_ROUTE, REPORTS_ROUTE, BACKUP_ROUTE, REGISTER_ROUTE
} from "../../consts";
import { Context } from "../..";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import "./Navbar.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

interface IProps {
  children: ReactNode;
}

interface ILink {
  link: string;
  text: string;
  roles?: string[];
}

const authLinks: ILink[] = [
  { link: COMPANIES_ROUTE, text: "companies.title", roles: ["Admin", "SuperAdmin"] },
  { link: FRIDGES_ROUTE, text: "fridges.title", roles: ["SuperAdmin", "Admin", "Contractor"] },
  { link: FRIDGEINVENTORY_ROUTE, text: "fridgeInventories.title", roles: ["SuperAdmin", "Admin", "Contractor"] },
  { link: NOTIFICATIONS_ROUTE, text: "notifications.title", roles: ["SuperAdmin", "Admin", "Contractor"] },
  { link: FOODITEMS_ROUTE, text: "foodItems.title", roles: ["SuperAdmin", "Admin"] },
  { link: ORDERS_ROUTE, text: "orders.title", roles: ["SuperAdmin", "Admin"] },
  { link: ORDERITEMS_ROUTE, text: "orderItems.title", roles: ["SuperAdmin", "Admin"] },
  { link: USERS_ROUTE, text: "users.title", roles: ["SuperAdmin", "Admin"] },
  { link: REPORTS_ROUTE, text: "reports.title", roles: ["SuperAdmin", "Admin", "Contractor"] },
  { link: BACKUP_ROUTE, text: "backup.title", roles: ["SuperAdmin"] },
];

const notAuthLinks: ILink[] = [
  { link: LOGIN_ROUTE, text: "login.title" },
  { link: REGISTER_ROUTE, text: "register.title" },
];

export const Navbar = observer(({ children }: IProps) => {
  const { t } = useTranslation();
  const contextValue = useContext(Context);
  const user = contextValue!.user;

  const logout = () => {
    localStorage.removeItem('token');
    user.setIsAuth(false);
  };

  useEffect(() => {
    console.log(user.user.role);
  }, []);

  return (
    <div>
      <header className="header">
        <div className="container">
          <NavLink to={MAIN_ROUTE} className="brand">
            SmartLunch
          </NavLink>
          <nav className="nav">
            <ul className="nav-list">
              {(user.isAuth ? authLinks.filter(l => l.roles?.includes(user.user.role)) : notAuthLinks)
                .map(({ link, text }) => (
                  <li key={link} className="nav-item">
                    <NavLink
                      to={link}
                      className={({ isActive }) =>
                        isActive ? "nav-link nav-link-active" : "nav-link"
                      }
                    >
                      {t(text)}
                    </NavLink>
                  </li>
                ))}
              {user.isAuth && (
                <>
                  <li className="nav-item">
                    <LanguageSwitcher />
                  </li>
                  <li className="nav-item">
                    <button className="logout-button" onClick={logout}>{t("logout")}</button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <div className="page-container">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
});
