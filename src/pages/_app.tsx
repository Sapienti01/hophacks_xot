import { type AppType } from "next/app";

import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import Layout from "~/components/AppShell";
import { useRouter } from "next/router";

const MyApp: AppType = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  const isClerk = pathname.includes("/sign-in") || pathname.includes("/sign-up");

  if (isClerk) {
    return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ClerkProvider {...pageProps}>
          <Component {...pageProps} />
        </ClerkProvider>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ClerkProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ClerkProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);