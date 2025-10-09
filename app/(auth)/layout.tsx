import Image from "next/image";
import Logo from "@/components/ui/logo";
import AuthBg from "@/public/images/auth-bg.svg";

export default function AuthLayout({
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
          <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 opacity-70 blur-[160px]"></div>
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
          {/* Right side - Event Theme */}
          <div className="relative my-6 mr-6 hidden w-[572px] shrink-0 overflow-hidden rounded-2xl lg:block">
            {/* Event Background Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900">
              {/* Unsplash conference image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2012&q=80')"
                }}
              />
              {/* Enhanced Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/50 to-blue-900/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Event Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center px-12 py-16 text-white">
              {/* Floating Event Cards */}
              <div className="space-y-6">
                {/* Event Card 1 */}
                <div className="animate-float-slow group rounded-xl bg-white/15 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/90 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-2.895 2-3 2s-3-.895-3-2 2.895-2 3-2 3 .895 3 2zm12-3c0 1.105-2.895 2-3 2s-3-.895-3-2 2.895-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Music Festival 2025</h3>
                      <p className="text-sm text-white/90">March 15, Jakarta</p>
                    </div>
                  </div>
                </div>

                {/* Event Card 2 */}
                <div className="animate-float-medium group ml-8 rounded-xl bg-white/15 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/90 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Tech Conference</h3>
                      <p className="text-sm text-white/90">April 20, Bandung</p>
                    </div>
                  </div>
                </div>

                {/* Event Card 3 */}
                <div className="animate-float-fast group rounded-xl bg-white/15 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/90 shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7H7zM9 9h6M9 13h6m-3 4h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Art Exhibition</h3>
                      <p className="text-sm text-white/90">May 10, Yogyakarta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Welcome to EventHub</h2>
                <p className="mt-2 text-white/95 drop-shadow-md">
                  Discover amazing events, connect with organizers, and create unforgettable experiences.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white drop-shadow-lg">10K+</div>
                  <div className="text-xs text-white/80">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white drop-shadow-lg">50K+</div>
                  <div className="text-xs text-white/80">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white drop-shadow-lg">1M+</div>
                  <div className="text-xs text-white/80">Tickets</div>
                </div>
              </div>

              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-2 w-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-3/4 right-1/4 h-1 w-1 bg-yellow-300/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/3 h-1.5 w-1.5 bg-blue-300/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 right-1/3 h-1 w-1 bg-pink-300/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
              </div>
            </div>
          </div>
        </>
      </main>
    </>
  );
}
