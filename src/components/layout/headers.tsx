"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LogIn, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { setCurrentUser } from "@/redux/features/users/usersSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define all navigation links with their permission requirements
const allNavigation = [
  // Public routes that everyone can access
  { href: "/", name: "Home", roles: ["PUBLIC"] },
  {
    href: "/customer",
    name: "Customer",
    roles: ["CUSTOMER", "PUBLIC", "ADMIN"],
  },
  {
    href: "/retailer",
    name: "Retailer",
    roles: ["DEALER", "ADMIN"],
  },
  { href: "/dealer", name: "Dealer", roles: ["ADMIN"] },
  { href: "/admin", name: "Admin", roles: ["ADMIN", , "DEALER"] },
  {
    href: "/vouchers",
    name: "Vouchers",
    roles: ["ADMIN"],
  },
  {
    href: "/my-vouchers",
    name: "My Vouchers",
    roles: ["RETAILER", "ADMIN"],
  },
  {
    href: "/claim-voucher",
    name: "Redeem",
    roles: ["RETAILER", "ADMIN"],
  },
  {
    href: "/products",
    name: "Products",
    roles: ["ADMIN"],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentUser = useSelector((state: any) => state.users.currentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      // Sign out the user from Firebase
      await signOut(auth);

      // Clear user from Redux store
      dispatch(setCurrentUser(null));

      // Clear localStorage
      localStorage.removeItem("userId");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Filter navigation links based on user role
  const navigation = useMemo(() => {
    if (!currentUser) {
      // If no user, only show public routes
      return allNavigation.filter((item) => item.roles.includes("PUBLIC"));
    }

    if (currentUser.role === "ADMIN") {
      // Admins can access everything
      return allNavigation;
    }

    // Filter routes based on user role
    return allNavigation.filter(
      (item) =>
        item.roles.includes(currentUser.role) || item.roles.includes("PUBLIC")
    );
  }, [currentUser]);

  return (
    <Disclosure
      as="nav"
      className="w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800"
    >
      <div className="mx-auto px-2 sm:px-6 lg:px-10">
        <div className="relative flex h-18 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                href={"/"}
                // className="text-[#f04d46] font-semibold font-chewy text-4xl"
              >
                <Image
                  src="/assets/logo.png"
                  alt="Vital-E Logo"
                  layout="initials"
                  width={135}
                  height={100}
                  className="h-10 mr-3"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={classNames(
                      pathname === item.href
                        ? "text-[#f04d46] font-medium"
                        : "text-gray-800 dark:text-gray-200 hover:text-[#f04d46]",
                      "rounded-md px-2 py-2 text-md hover:scale-102 transition-transform"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Theme toggle button */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mr-4 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-700" />
                )}
              </Button>
            )}

            {/* Sign In / Profile dropdown */}
            {!currentUser ? (
              <Button variant="filled" onClick={() => router.push("/sign-in")}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            ) : (
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full border-2 p-0.5 border-[#f04d46] text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                        currentUser.name || "User"
                      }`}
                      className="size-8 rounded-full"
                    />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute border border-[#f04d46]  right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <Link
                      href={"/profile"}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 data-focus:bg-gray-100  dark:data-focus:bg-gray-700 data-focus:outline-hidden"
                    >
                      Your Profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:outline-hidden"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <DisclosureButton
                aria-current={pathname === item.href ? "page" : undefined}
                className={classNames(
                  pathname === item.href
                    ? "text-[#f04d46] font-medium"
                    : "text-gray-500 dark:text-gray-300 hover:text-[#f04d46]",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                {item.name}
              </DisclosureButton>
            </Link>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
