"use client";

import {Suspense, useEffect, useState} from "react";
import {Card, CardBody} from "@heroui/react";
import {Icon} from "@iconify/react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import Image from "next/image";

import {
    cancelReservationPayment,
    getReservationWithDetails,
} from "@/db/actions";

function PaymentCancelContent() {
    const searchParams = useSearchParams();
    const reservationId = searchParams.get("reservationId");
    const [isProcessing, setIsProcessing] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [reservationDetails, setReservationDetails] = useState<any>(null);

    useEffect(() => {
        const handleCancellation = async () => {
            if (reservationId) {
                try {
                    // First get reservation details
                    const details = await getReservationWithDetails(
                        parseInt(reservationId),
                    );

                    setReservationDetails(details);

                    const success = await cancelReservationPayment(
                        parseInt(reservationId),
                    );

                    setIsSuccess(success);
                } catch (error) {
                    console.error("Error cancelling reservation payment:", error);
                    setIsSuccess(false);
                } finally {
                    setIsProcessing(false);
                }
            } else {
                setIsProcessing(false);
            }
        };

        handleCancellation();
    }, [reservationId]);

    if (isProcessing) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardBody className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"/>
                        <p className="mt-2">Zpracovávání zrušení...</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full px-2 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center gap-4 pt-20">
                <div className="flex items-center justify-center mb-4">
                    <Icon
                        className="h-24 w-24 text-orange-500"
                        icon="solar:close-circle-linear"
                    />
                </div>

                <h1 className="text-4xl text-center font-bold pt-4 pb-2 text-orange-600">
                    Platba zrušena
                </h1>

                {reservationDetails ? (
                    <p className="text-lg text-center max-w-lg">
                        Platba za lekci <b>{reservationDetails.class?.classType?.name}</b>{" "}
                        dne{" "}
                        <b>
                            {new Date(
                                reservationDetails.class?.date ?? -1,
                            ).toLocaleDateString("cs-CZ", {
                                weekday: "long",
                            })}{" "}
                            {new Date(
                                reservationDetails.class?.date ?? -1,
                            ).toLocaleDateString("cs-CZ")}{" "}
                            v {reservationDetails.class?.time}
                        </b>{" "}
                        byla zrušena. Rezervace nebyla dokončena.
                    </p>
                ) : (
                    <p className="text-lg text-center max-w-lg">
                        Platba byla zrušena. Rezervace nebyla dokončena.
                    </p>
                )}

                <p className="text-gray-600 text-center">
                    Můžete zkusit provést rezervaci znovu nebo zvolit jiný způsob platby.
                </p>

                {reservationDetails?.class?.trainer?.profilePicture && (
                    <Image
                        alt="Trenér/ka"
                        className="w-32 h-32 rounded-full object-cover mt-4 opacity-50"
                        height={128}
                        src={reservationDetails.class.trainer.profilePicture}
                        width={128}
                    />
                )}

                <div className="flex gap-4 justify-center mt-8">
                    <Link
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        href="/"
                    >
                        Domů
                    </Link>
                    <Link
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                        href="/reservation"
                    >
                        Nová rezervace
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentCancelPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-md mx-auto">
                        <CardBody className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"/>
                            <p className="mt-2">Načítání...</p>
                        </CardBody>
                    </Card>
                </div>
            }
        >
            <PaymentCancelContent/>
        </Suspense>
    );
}
