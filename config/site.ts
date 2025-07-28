export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "BeBrave Studio",
    description: "Group fitness classes",
    navItems: [
        {
            label: "O Nás",
            href: "#onas",
        },
        {
            label: "Lekce",
            href: "#lekce",
        },
        {
            label: "Instruktoři",
            href: "#instruktori",
        },
    ],
    navMenuItems: [
        {
            label: "O Nás",
            href: "#onas",
        },
        {
            label: "Lekce",
            href: "#lekce",
        },
        {
            label: "Instruktoři",
            href: "#instruktori",
        },
        {
            label: "Rezervace",
            href: "/reservation",
        },
    ],
    links: {
        github: "https://github.com/heroui-inc/heroui",
        twitter: "https://twitter.com/hero_ui",
        docs: "https://heroui.com",
        discord: "https://discord.gg/9b6yyZKmH4",
        sponsor: "https://patreon.com/jrgarciadev",
    },
};
