 /* eslint-disable */
 import { UserButton } from '@clerk/nextjs';
import {
    createStyles,
    Header,
    Group,
    Box,
    rem,
    ActionIcon,
    Menu,
  } from '@mantine/core';
  import {
    Icon24Hours,
    IconWorld,
  } from '@tabler/icons-react';
  
  const useStyles = createStyles((theme) => ({
    link: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
      textDecoration: 'none',
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      fontWeight: 500,
      fontSize: theme.fontSizes.sm,
  
      [theme.fn.smallerThan('sm')]: {
        height: rem(42),
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      },
  
      ...theme.fn.hover({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      }),
    },
  }));
  
  
  export function HeaderMegaMenu() {
    const { classes, theme } = useStyles();
  
    return (
      <Box >
        <Header height={60} px="md">
          <Group position="apart" sx={{ height: '100%' }}>
            <Icon24Hours size={30} color={theme.fn.primaryColor()} />
            <Group sx={{ height: '100%' }} spacing={0}>
              <a href="/" className={classes.link}>
                Home
              </a>
              <a href="/appointments" className={classes.link}>
                Past Recordings
              </a>
            </Group>
            <Group >  
            </Group>
          </Group>
        </Header>
      </Box>
    );
  }