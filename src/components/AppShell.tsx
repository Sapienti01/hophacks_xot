import { UserButton } from "@clerk/nextjs";
import { AppShell, Navbar, Header, Button, Grid } from "@mantine/core";
import { HeaderMegaMenu } from "./Header";
type Props = {
  children: React.ReactNode;
};
export default function Layout({ children }: Props) {
  return (
    <AppShell
      padding="md"
      header={
        <HeaderMegaMenu/>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}
