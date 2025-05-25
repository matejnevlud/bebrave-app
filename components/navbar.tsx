import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarItem,
    NavbarMenuItem,
} from "@heroui/navbar";
import {Button} from "@heroui/button";
import {Kbd} from "@heroui/kbd";
import {Link} from "@heroui/link";
import {Input} from "@heroui/input";
import {link as linkStyles} from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import Image from 'next/image'
import {siteConfig} from "@/config/site";
import {ThemeSwitch} from "@/components/theme-switch";
import {
    TwitterIcon,
    GithubIcon,
    DiscordIcon,
    HeartFilledIcon,
    SearchIcon,
    Logo,
} from "@/components/icons";
import {Calendar, CalendarDays} from "lucide-react";

export const Navbar = () => {
    const searchInput = (
        <Input
            aria-label="Search"
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
            }}
            endContent={
                <Kbd className="hidden lg:inline-block" keys={["command"]}>
                    K
                </Kbd>
            }
            labelPlacement="outside"
            placeholder="Search..."
            startContent={
                <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
            }
            type="search"
        />
    );

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-5" href="/">
                        {/*<Image src="/loga/bebrave_black.png" width={150} height={41}  alt={"logo"} className="pb-2"/>*/}
                        <Image src="/loga/b_black.png" width={24} height={24}  alt={"logo"} className=" "/>
                    </NextLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="" justify="center">
                <ul className="hidden md:flex gap-8 justify-start ml-2">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href} className={""}>
                            <NextLink
                                className={clsx(
                                    linkStyles({color: "foreground"}),
                                    "font-normal",
                                    // add animation on hover, 1sec
                                    "transition-all duration-100 ease-in-out",
                                    //"w-16 justify-center",
                                    "hover:font-bold",
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href={item.href}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end" >
                <NavbarItem className="hidden sm:flex">
                    <Button
                        isExternal
                        as={Link}
                        className="text-sm font-normal text-default-600 bg-default-100"
                        href={"siteConfig.links.sponsor"}
                        startContent={<CalendarDays className={"pb-0.5"} size={24}  />}
                        variant="flat"
                    >
                        Rezervovat
                    </Button>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent className=" basis-1 pl-4x sm:hidden " justify="end">
                <NavbarMenuToggle/>
            </NavbarContent>

            <NavbarMenu>
                {searchInput}
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index === siteConfig.navMenuItems.length - 1
                                            ? "danger"
                                            : "foreground"
                                }
                                href="#"
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};
