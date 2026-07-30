export const siteConfig = {
  name: "ParcelFlow",
  description: "Modern Apartment Parcel & Delivery Notification SaaS",
  roles: {
    SUPER_ADMIN: "super_admin",
    APARTMENT_MANAGER: "apartment_manager",
  },
  couriers: [
    "Amazon",
    "Flipkart",
    "Myntra",
    "BlueDart",
    "Delhivery",
    "FedEx",
    "DTDC",
    "Blinkit",
    "Zepto",
    "Swiggy Instamart",
    "Other Courier",
  ],
  adminNav: [
    { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { title: "Apartments", href: "/admin/apartments", icon: "Building2" },
    { title: "Managers", href: "/admin/managers", icon: "Users" },
    { title: "Settings", href: "/admin/settings", icon: "Settings" },
  ],
  managerNav: [
    { title: "Dashboard", href: "/manager", icon: "LayoutDashboard" },
    { title: "Flats", href: "/manager/flats", icon: "Home" },
    { title: "Residents", href: "/manager/residents", icon: "Users" },
    { title: "Deliveries", href: "/manager/deliveries", icon: "PackageCheck" },
    { title: "Settings", href: "/manager/settings", icon: "Settings" },
  ],
};
