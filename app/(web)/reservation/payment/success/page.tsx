"use client";

// Payment Success Page
import { Suspense, useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// @ts-ignore
import confetti from "canvas-confetti";

import { getReservationWithDetails } from "@/db/actions";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkReservationStatus = async () => {
      if (!reservationId) {
        setIsProcessing(false);
        setErrorMessage("Nebyl nalezen identifikátor rezervace.");

        return;
      }

      try {
        const details = await getReservationWithDetails(
          parseInt(reservationId),
        );

        if (!details) {
          setErrorMessage("Rezervace nebyla nalezena.");
          setIsProcessing(false);

          return;
        }

        setReservationDetails(details);

        // Check payment status
        if (details.paymentStatus === "completed") {
          // Payment was successfully processed by webhook
          setIsSuccess(true);
          setIsProcessing(false);

          // Trigger confetti animation
          confetti({
            particleCount: 200,
            startVelocity: 60,
          });
        } else if (details.paymentStatus === "pending" && retryCount < 10) {
          // Payment is still pending, retry after a few seconds
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 3000); // Wait 3 seconds before retrying
        } else if (details.paymentStatus === "failed") {
          // Payment failed
          setIsSuccess(false);
          setIsProcessing(false);
          setErrorMessage("Platba se nezdařila.");
        } else {
          // Max retries reached, payment still pending
          setIsSuccess(false);
          setIsProcessing(false);
          setErrorMessage(
            "Platba stále čeká na zpracování. Zkuste obnovit stránku za chvíli.",
          );
        }
      } catch (error) {
        console.error("Error checking reservation status:", error);
        setErrorMessage("Došlo k chybě při kontrole stavu rezervace.");
        setIsProcessing(false);
      }
    };

    checkReservationStatus();
  }, [reservationId, retryCount]);

  if (isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2">
              {retryCount === 0
                ? "Zpracovávání platby..."
                : `Čekání na potvrzení platby... (${retryCount}/10)`}
            </p>
            {retryCount > 0 && (
              <>
                <p className="text-sm text-gray-500 mt-2">
                  Platba je zpracovávána, prosím čekejte...
                </p>
                <button
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
                  onClick={() => {
                    setRetryCount(0);
                    setIsProcessing(true);
                  }}
                >
                  Zkontrolovat nyní
                </button>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!reservationId || errorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Chyba</h1>
          </CardHeader>
          <CardBody className="text-center">
            <p>{errorMessage || "Nebyl nalezen identifikátor rezervace."}</p>
            <div className="flex gap-4 justify-center mt-4">
              <Link
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                href="/"
              >
                Domů
              </Link>
              <Link
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                href="/reservation"
              >
                Nová rezervace
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isSuccess && reservationDetails) {
    // Success page matching onsite payment design
    return (
      <div className="w-full px-2 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 pt-20">
          <Image
            alt="Děkujeme za vaši rezervaci!"
            className="w-72 h-72 rounded-full object-cover"
            height={288}
            src={
              reservationDetails.class?.trainer?.profilePicture ??
              "/photos/trainers/martina.jpg"
            }
            width={288}
          />

          <h1 className="text-4xl text-center font-bold pt-4 pb-2">
            Děkujeme za vaši rezervaci!
          </h1>
          <p className="text-lg text-center">
            Vaše rezervace na lekci{" "}
            <b>{reservationDetails.class?.classType?.name}</b> dne{" "}
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
            byla úspěšně potvrzena a zaplacena. Těšíme se na vás, tým BeBrave.
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              href="/"
            >
              Domů
            </Link>
            <Link
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              href="/reservation"
            >
              Nová rezervace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failure or error page
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Icon
              className="h-16 w-16 text-red-500"
              icon="solar:close-circle-linear"
            />
          </div>
          <h1 className="text-2xl font-bold text-red-600">Platba selhala</h1>
        </CardHeader>
        <CardBody className="text-center space-y-4">
          <p className="text-gray-600">
            Platba se nezdařila. Rezervace nebyla potvrzena.
          </p>
          <p className="text-sm text-gray-500">
            Můžete zkusit provést rezervaci znovu nebo zvolit jiný způsob
            platby.
          </p>
          {errorMessage && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              href="/"
            >
              Domů
            </Link>
            <Link
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors"
              href="/reservation"
            >
              Zkusit znovu
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2">Zpracovávání platby...</p>
            </CardBody>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
