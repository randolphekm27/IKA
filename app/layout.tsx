import React from "react";

export interface Metadata {
  title?: string | { default: string; template: string };
  description?: string;
  keywords?: string[];
  authors?: Array<{ name: string; url?: string }>;
  creator?: string;
  metadataBase?: URL;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
  };
  icons?: {
    icon?: string;
    shortcut?: string;
    apple?: string;
  };
}


export const metadata: Metadata = {
  title: {
    default: "IKA — Les photos de votre événement, en temps réel.",
    template: "%s | IKA",
  },
  description:
    "IKA est une plateforme de galerie photo événementielle live. Partagez un QR Code, et vos invités consultent les photos en temps réel pendant l'événement.",
  keywords: ["galerie photo", "événement", "temps réel", "QR code", "photographe", "mariage", "soirée"],
  authors: [{ name: "IKA" }],
  creator: "IKA",
  metadataBase: new URL("https://ika-xi.vercel.app"),
  openGraph: {
    title: "IKA — Les photos de votre événement, en temps réel.",
    description:
      "Partagez un QR Code à vos invités. Ils consultent les photos en temps réel pendant l'événement.",
    url: "https://ika-xi.vercel.app",
    siteName: "IKA",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IKA — Galerie photo live",
    description: "Les photos de votre événement, en temps réel.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
