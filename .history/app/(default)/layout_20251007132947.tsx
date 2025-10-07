"use client";

import { useEffect, useState } from "react";
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
  const [mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });

    // Check for mock user data (for testing when database isn't set up)
    const mockUserData = sessionStorage.getItem('mockUser');
    if (mockUserData) {
      setMockUser(JSON.parse(mockUserData));
    }
  }, []);

  // Check if user is authenticated (either real session or mock)
  const isAuthenticated = session || mockUser;

  // Debug logging (remove in production)
  useEffect(() => {
    console.log('Layout Debug:', {
      sessionStatus: status,
      hasSession: !!session,
      hasMockUser: !!mockUser,
      isAuthenticated: !!isAuthenticated
    });
  }, [session, mockUser, status, isAuthenticated]);

  return (
    <>
      {/* Conditionally render header based on authentication status */}
      {status === "loading" ? (
        // Show regular header while loading
        <Header />
      ) : isAuthenticated ? (
        // Show burger header for authenticated users (real or mock)
        <BurgerHeader />
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
