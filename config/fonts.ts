import {Fira_Code, Inter} from "next/font/google";
import localFont from 'next/font/local'

export const fontRunalto = localFont({
    src: './fonts/runalto.woff2',
    variable: '--font-serif',
})


export const fontFilson = localFont({
   src: [
       { path: './fonts/FilsonPro-Thin.woff2', weight: '100', style: 'normal' },
       { path: './fonts/FilsonPro-ThinItalic.woff2', weight: '100', style: 'italic' },
       { path: './fonts/FilsonPro-Light.woff2', weight: '300', style: 'normal' },
       { path: './fonts/FilsonPro-LightItalic.woff2', weight: '300', style: 'italic' },
       { path: './fonts/FilsonPro-Regular.woff2', weight: '400', style: 'normal' },
       { path: './fonts/FilsonPro-RegularItalic.woff2', weight: '400', style: 'italic' },
       { path: './fonts/FilsonPro-Medium.woff2', weight: '500', style: 'normal' },
       { path: './fonts/FilsonPro-MediumItalic.woff2', weight: '500', style: 'italic' },
       { path: './fonts/FilsonPro-Bold.woff2', weight: '700', style: 'normal' },
       { path: './fonts/FilsonPro-BoldItalic.woff2', weight: '700', style: 'italic' },
       { path: './fonts/FilsonPro-Heavy.woff2', weight: '800', style: 'normal' },
       { path: './fonts/FilsonPro-HeavyItalic.woff2', weight: '800', style: 'italic' },
       { path: './fonts/FilsonPro-Black.woff2', weight: '900', style: 'normal' },
       { path: './fonts/FilsonPro-BlackItalic.woff2', weight: '900', style: 'italic' },
   ],
    display: 'swap',
    variable: '--font-sans',
});




export const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const fontMono = Fira_Code({
    subsets: ["latin"],
    variable: "--font-mono",
});
