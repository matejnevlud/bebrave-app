"use client";

import {useEffect} from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error;
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        /* eslint-disable no-console */
        console.error(error);

        // Send error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div>
            <h2>
                Moc se omlouváme, ale došlo k chybě. Pokud problém přetrvává,
                kontaktujte nás na telefonním čísle 731 906 623.
            </h2>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    );
}
