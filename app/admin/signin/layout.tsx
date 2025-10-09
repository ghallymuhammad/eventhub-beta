'use client';

import Image from "next/image";
import Logo from "@/components/ui/logo";

export default function AdminSigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="absolute z-30 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Site branding */}
            <div className="mr-4 shrink-0">
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex grow">
        <div
          className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-linear-to-tr from-red-500 opacity-70 blur-[160px]"></div>
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="flex h-full flex-col justify-center before:min-h-[4rem] before:flex-1 after:flex-1 md:before:min-h-[5rem]">
            <div className="px-4 sm:px-6">
              <div className="mx-auto w-full max-w-sm">
                <div className="py-16 md:py-20">{children}</div>
              </div>
            </div>
          </div>
        </div>

        <>
          {/* Right side - Admin Theme */}
          <div className="relative my-6 mr-6 hidden w-[572px] shrink-0 overflow-hidden rounded-2xl lg:block">
            {/* Admin Background - Dark theme with security imagery */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900 to-purple-900">
              {/* Security/admin themed background */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80')"
                }}
              />
              {/* Dark overlay for admin theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
            </div>

            {/* Admin Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center px-12 py-16 text-white">
              {/* Security Icons Grid */}
              <div className="space-y-6">
                {/* Security Feature 1 */}
                <div className="animate-float-slow group rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/80">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-100">Secure Access</h3>
                      <p className="text-sm text-white/70">Protected admin panel</p>
                    </div>
                  </div>
                </div>

                {/* Management Feature */}
                <div className="animate-float-medium group ml-8 rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/80">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-100">Event Management</h3>
                      <p className="text-sm text-white/70">Approve & monitor events</p>
                    </div>
                  </div>
                </div>

                {/* Analytics Feature */}
                <div className="animate-float-fast group rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/80">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-100">Analytics</h3>
                      <p className="text-sm text-white/70">Platform insights</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Welcome Text */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-red-100">Administrator Panel</h2>
                <p className="mt-2 text-white/80">
                  Secure access to manage events, users, and platform operations.
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <span className="text-sm text-green-300">Secure Connection Active</span>
              </div>

              {/* Warning notice */}
              <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-300">Authorized Personnel Only</h4>
                    <p className="text-xs text-red-200/80 mt-1">
                      This area is restricted to system administrators. All activities are logged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Animated security elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-1 w-1 bg-red-300/40 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-3/4 right-1/4 h-1.5 w-1.5 bg-purple-300/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/3 h-1 w-1 bg-blue-300/50 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
              </div>
            </div>
          </div>
        </>
      </main>
    </>
  );
}
