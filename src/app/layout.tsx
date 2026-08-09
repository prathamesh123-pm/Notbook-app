
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider'
import { AuthTrigger } from '@/components/firebase-auth-trigger'

export const metadata: Metadata = {
  title: 'संकलन नोंदवही',
  description: 'दूध संकलन व्यवस्थापन आणि दैनंदिन कार्य नोंदवही.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthTrigger />
          <SidebarProvider defaultOpen={true}>
            <DashboardSidebar />
            <SidebarInset className="bg-background">
              <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex flex-1 items-center justify-between">
                  <h1 className="text-base font-headline font-black text-foreground tracking-tight">संकलन नोंदवही</h1>
                </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-3 md:p-8 overflow-x-hidden">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
