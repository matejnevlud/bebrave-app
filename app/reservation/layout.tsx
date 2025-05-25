export default function BlogLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <section className="max-w-7xl">
            {children}

        </section>
    );
}
