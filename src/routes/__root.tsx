import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { PosProvider } from "@/lib/pos/store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Crave POS — Modern Fast-Food Point of Sale" },
      { name: "description", content: "A calm, fast, touchscreen-first POS for fast-food restaurants. Take orders, accept cash or UPI, and track sales effortlessly." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Crave POS — Modern Fast-Food Point of Sale" },
      { property: "og:description", content: "A calm, fast, touchscreen-first POS for fast-food restaurants. Take orders, accept cash or UPI, and track sales effortlessly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Crave POS — Modern Fast-Food Point of Sale" },
      { name: "twitter:description", content: "A calm, fast, touchscreen-first POS for fast-food restaurants. Take orders, accept cash or UPI, and track sales effortlessly." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f7dfe7a3-2292-4c3f-b5bb-80efb084d0d2/id-preview-552bf2d7--b492aeac-7433-4e9f-837e-7863691ba016.lovable.app-1777281939351.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f7dfe7a3-2292-4c3f-b5bb-80efb084d0d2/id-preview-552bf2d7--b492aeac-7433-4e9f-837e-7863691ba016.lovable.app-1777281939351.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <PosProvider>
      <Outlet />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-soft-lg)",
            borderRadius: "12px",
          },
        }}
      />
    </PosProvider>
  );
}
