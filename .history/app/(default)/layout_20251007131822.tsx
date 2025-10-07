"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import AOS from "aos";
import "aos/dist/aos.css";

import Header from "@/components/ui/header";
import BurgerHeader from "@/components/ui/burger-header";
import Footer from "@/components/ui/footer";
import UserRoleIndicator from "@/components/UserRoleIndicator";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <>
      {/* Conditionally render header based on authentication status */}
      {status === "loading" ? (
        // Show regular header while loading
        <Header />
      ) : session ? (
        // Show burger header for authenticated users
        <BurgerHeader user={session.user} />
      ) : (
        // Show regular header for guests
        <Header />
      )}

      <main className="grow">{children}</main>

      <Footer border={true} />
      
      <UserRoleIndicator />
    </>
  );
}
