"use client";

import {
  Image,
  Card,
  CardBody,
  Calendar,
  SelectItem,
  Select,
  SelectedItems,
  Avatar,
  Form,
  Chip,
} from "@heroui/react";
import React, { Fragment, useEffect, useState } from "react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
// @ts-ignore
import confetti from "canvas-confetti";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

import PaymentMethodRadioGroup from "@/components/blocks/PaymentMethodRadio";
import {
  ClassType,
  ClassWithRelations,
  Trainer,
  TrainerWithRelations,
} from "@/db/schema";
import HorizontalSteps from "@/components/blocks/HorizontalSteps";
import {
  createReservation,
  getClasses,
  getClassTypes,
  getTrainers,
} from "@/db/actions";
import { parseAllowedPaymentMethods } from "@/lib/utils/payment-methods";
import { FormStorage, ReservationFormData } from "@/lib/utils/form-storage";

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "/photos/nahledy/bebrave-17.jpg",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Tech Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "/photos/nahledy/bebrave-18.jpg",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Sr. Dev",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "/photos/nahledy/bebrave-19.jpg",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "C.M.",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "/photos/nahledy/bebrave-20.jpg",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "S. Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "/photos/nahledy/bebrave-21.jpg",
    email: "kristen.cooper@example.com",
  },
  {
    id: 6,
    name: "Brian Kim",
    role: "P. Manager",
    team: "Management",
    age: "29",
    avatar: "/photos/nahledy/bebrave-22.jpg",
    email: "brian.kim@example.com",
    status: "active",
  },
];

type User = {
  id: number;
  name: string;
  role: string;
  team: string;
  status: string;
  age: string;
  avatar: string;
  email: string;
};

function ReservationPage() {
  const [selected, setSelected] = useState("videos");

  const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);

  const [classes, setClasses] = useState<ClassWithRelations[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentDate, setCurrentDate] = useState<CalendarDate | null>(null);

  async function fetchData() {
    const t = await getTrainers();
    const ct = await getClassTypes();
    const c = await getClasses();

    console.log(t);
    console.log(c);
    console.log(ct);

    setTrainers(t);
    setClassTypes(ct);
    setClasses(c);

    setIsFetchingData(false);
  }

  useEffect(() => {
    fetchData();
    setIsHydrated(true);
    setCurrentDate(today(getLocalTimeZone()));
  }, []);

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = FormStorage.loadFormData();

    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // Moved to useEffect to prevent hydration issues
  // Disabled ranges will be handled after hydration

  // FORM DATA
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(
    null,
  );
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassWithRelations | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  // Form data state
  const [formData, setFormData] = useState<ReservationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentMethod: "credit_card",
    // Invoice address fields
    address: "",
    city: "",
    postalCode: "",
    country: "Česká republika",
  });

  function determineStep() {
    var step = 0;

    if (selectedClassType) step = 1;
    if (selectedTrainer) step = 2;

    if (selectedDate) step = 3;

    if (selectedClass) step = 4;

    if (isFormSubmitted) step = 5;

    return step; // Example: returning step 1 as the current step
  }

  function handleClassTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const classType =
      classTypes.find((ct) => ct.id.toString() == event.target.value) || null;

    setSelectedClassType(classType);

    if (classType) {
      setSelectedTrainer(null);
    }
    setSelectedDate(null);
  }

  function handleTrainerChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const trainer =
      trainers.find((t) => t.id.toString() == event.target.value) || null;

    setSelectedTrainer(trainer);
    setSelectedDate(null);
  }

  const availableClassesBasedOnSelection = React.useMemo(() => {
    let availableClasses: ClassWithRelations[] = classes;

    if (selectedClassType)
      availableClasses = classes.filter(
        (c) => c.classTypeId == selectedClassType.id,
      );

    if (selectedTrainer)
      availableClasses = availableClasses.filter(
        (c) => c.trainerId == selectedTrainer.id,
      );

    return availableClasses;
  }, [selectedClassType, selectedTrainer, classes, trainers]);

  const availableClassesForDate = React.useMemo(() => {
    if (!selectedDate) return [];

    return availableClassesBasedOnSelection.filter((c) => {
      return c.date === selectedDate.toString();
    });
  }, [selectedDate, availableClassesBasedOnSelection]);

  const classesToRender = React.useMemo(() => {
    let classesToRender = selectedDate
      ? availableClassesForDate
      : availableClassesBasedOnSelection;

    // Order by date and time
    classesToRender.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateA.getTime() - dateB.getTime() || a.time.localeCompare(b.time);
    });

    // Group classes by date
    let groupedClasses: Record<string, ClassWithRelations[]> = {};

    classesToRender.forEach((c) => {
      const dateKey = c.date.toString();

      if (!groupedClasses[dateKey]) {
        groupedClasses[dateKey] = [];
      }
      groupedClasses[dateKey].push(c);
    });

    // Sort groupedClasses by time in that date, the time field is a string in HH:MM format, from the earliest to the latest
    // firt create date time objects from the time strings, then sort them
    Object.keys(groupedClasses).forEach((dateKey) => {
      groupedClasses[dateKey].sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);

        return timeA[0] - timeB[0] || timeA[1] - timeB[1];
      });
    });

    return groupedClasses;
  }, [selectedDate, availableClassesBasedOnSelection, availableClassesForDate]);

  let isDateUnavailable = (date: any) =>
    !availableClassesBasedOnSelection.some(
      (c) => date.toString() === c.date.toString(),
    );

  function hasClassFreeSpot(c: ClassWithRelations) {
    // Check if the class has any reservations
    if (!c.reservations || c.reservations.length === 0) {
      return true; // No reservations means free spot
    }

    return c.reservations.length < c.capacity;
  }

  // Payment method configuration based on class type
  const [allowQr, setAllowQr] = useState<boolean>(false);
  const [disableOnsite, setDisableOnsite] = useState<boolean>(false);

  useEffect(() => {
    if (selectedClass?.classType?.allowedPaymentMethods) {
      const paymentConfig = parseAllowedPaymentMethods(selectedClass.classType.allowedPaymentMethods);
      setAllowQr(paymentConfig.allowQr);
      setDisableOnsite(!paymentConfig.allowOnsite);
    } else {
      // Default fallback - allow all payment methods
      setAllowQr(true);
      setDisableOnsite(false);
    }
  }, [selectedClass]);

  // Handle form field changes and save to localStorage
  const handleFormFieldChange = (
    field: keyof ReservationFormData,
    value: string,
  ) => {
    const newFormData = { ...formData, [field]: value };

    setFormData(newFormData);
    FormStorage.saveFormData(newFormData);
  };

  // Clear form data
  const handleClearForm = () => {
    if (confirm("Opravdu chcete vymazat všechny uložené údaje?")) {
      const emptyFormData: ReservationFormData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        paymentMethod: "credit_card",
        address: "",
        city: "",
        postalCode: "",
        country: "Česká republika",
      };

      setFormData(emptyFormData);
      FormStorage.clearFormData();
    }
  };

  async function handleReservationSubmit(event: any) {
    event.preventDefault();

    const form = event.currentTarget;

    console.log(form);

    setIsSubmitting(true);

    try {
      // wait for 2 seconds to simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let userData = Object.fromEntries(new FormData(form));

      console.log("userData", userData);

      const response = await createReservation(
        selectedClass as ClassWithRelations,
        undefined,
        userData,
      );

      if (typeof response === "string") {
        // Credit card payment - redirect to Nexi payment page
        window.location.href = response;
      } else if (response === true) {
        // Other payment methods - show success
        setIsFormSubmitted(true);
        confetti({
          particleCount: 200,
          startVelocity: 60,
        });
      } else {
        alert("Chyba při vytváření rezervace. Zkuste to prosím znovu.");
      }
    } catch (error) {
      console.error("Error submitting reservation form:", error);
      alert(
        "Došlo k chybě při odesílání rezervace. Zkuste to prosím znovu později.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-4 pt-4 max-w-7xl">
      <h1 className="text-4xl font-sans font-bold">Rezervační systém</h1>

      <HorizontalSteps
        currentStep={determineStep()}
        steps={[
          {
            title: "Vyberte typ lekce",
          },
          {
            title: "Vyberte trenéra",
          },
          {
            title: "Zvolte datum a čas",
          },
          {
            title: "Vyplňte údaje",
          },
          {
            title: "Odešlete rezervaci",
          },
        ]}
      />

      {/* Calendar chooser */}
      <section
        className={
          "w-full px-2 max-w-3xl " + (determineStep() >= 4 ? "hidden" : "")
        }
      >
        <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 my-4 items-center justify-center">
          <Select
            aria-label="Select Class Type"
            classNames={{
              base: " fl",
              trigger: "h-12",
            }}
            isDisabled={isFetchingData}
            isLoading={isFetchingData}
            items={classTypes}
            maxListboxHeight={400}
            placeholder="Vybrat Typ lekce"
            renderValue={(items: SelectedItems<ClassType>) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={item.data?.image as any}
                  />
                  <div className="flex flex-col">
                    <span>{item.data?.name}</span>
                  </div>
                </div>
              ));
            }}
            selectedKeys={
              selectedClassType ? [selectedClassType.id.toString()] : []
            }
            onChange={handleClassTypeChange}
          >
            {(user) => (
              <SelectItem key={user.id} textValue={user.name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={user.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={user.image as any}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          <Select
            aria-label="Select Trainer"
            classNames={{
              base: "fl",
              trigger: "h-12",
            }}
            disabledKeys={
              selectedClassType
                ? trainers
                    .filter(
                      (t) =>
                        !t.trainerClassTypes?.some(
                          (tct) => tct.classTypeId === selectedClassType?.id,
                        ),
                    )
                    .map((t) => t.id.toString())
                : []
            }
            isDisabled={isFetchingData}
            isLoading={isFetchingData}
            items={trainers}
            maxListboxHeight={400}
            placeholder="Vybrat trenéra"
            renderValue={(items: SelectedItems<TrainerWithRelations>) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={item.data?.profilePicture as any}
                  />
                  <div className="flex flex-col">
                    <span>{item.data?.name}</span>
                    <span className="text-default-500 text-tiny">
                      {item.data?.trainerClassTypes
                        ?.map((tcp) => tcp.classType?.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              ));
            }}
            selectedKeys={
              selectedTrainer ? [selectedTrainer.id.toString()] : []
            }
            onChange={handleTrainerChange}
          >
            {(user) => (
              <SelectItem key={user.id} textValue={user.name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={user.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={user.profilePicture as any}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                    <span className="text-tiny text-default-400">
                      {user?.trainerClassTypes
                        ?.map((tcp) => tcp.classType?.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>

        {isHydrated && (
          <I18nProvider locale="cs-CZ">
            <Calendar
              hideDisabledDates
              aria-label="Date"
              calendarWidth={"16rem"}
              className={isFetchingData ? "opacity-50" : ""}
              isDateUnavailable={isDateUnavailable}
              minValue={currentDate as any}
              pageBehavior={"single"}
              value={selectedDate as any}
              visibleMonths={3}
              weekdayStyle="short"
              onChange={setSelectedDate as any}
            />
          </I18nProvider>
        )}

        <div className="w-full max-w-3xl pt-6">
          {Object.entries(classesToRender).map(([date, classes]) => (
            <Fragment key={date}>
              <h2 className="text-xl font-bold text-center py-3">
                {isHydrated
                  ? new Date(date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                    })
                  : ""}{" "}
                {isHydrated ? new Date(date).toLocaleDateString("cs-CZ") : ""}
              </h2>
              {classes.map((c: ClassWithRelations) => (
                <div
                  key={c.id}
                  className="flex my-6 gap-3 sm:gap-6 items-start sm:items-center flex-col sm:flex-row"
                >
                  <div className=" ml-4 sm:ml-0 lg:absolute lg:ml-[-5rem] items-center flex flex-row sm:flex-col gap-2 justify-center lg:w-14">
                    <b>{c.time}</b>
                    <span className="text-tiny">
                      {c.classType.duration} min
                    </span>
                  </div>
                  <Card
                    key={c.id}
                    className="hover:shadow-lg transition-shadow duration-200 flex-1"
                    isDisabled={!hasClassFreeSpot(c)}
                    isPressable={hasClassFreeSpot(c)}
                    onPress={() => setSelectedClass(c)}
                  >
                    <CardBody className="flex flex-row sm:flex-row items-start sm:items-center gap-3 p-0 h-36">
                      <Image
                        alt={c.classType.name}
                        className="w-28 sm:w-36 h-36 rounded-none object-cover"
                        src={c.classType.image as any}
                      />
                      <div className="flex-1 h-full flex flex-col justify-between py-2 pe-2">
                        <div>
                          <h3 className="text-md font-semibold">
                            {c.classType.name}
                          </h3>
                          <p className="text-small line-clamp-3 text-justify text-justify">
                            {c.classType.description}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Avatar
                            alt={c.trainer?.name}
                            className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                            size="sm"
                            src={c.trainer?.profilePicture as any}
                          />
                          <span className="text-small sm:text-medium">
                            {c.trainer?.name}
                          </span>
                          {c.secondTrainer && (
                            <div className="inline-block ml-4">
                              <Avatar
                                alt={c.secondTrainer?.name}
                                className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                                size="sm"
                                src={c.secondTrainer?.profilePicture as any}
                              />
                              <span className="text-small sm:text-medium">
                                {c.secondTrainer?.name}
                              </span>
                            </div>
                          )}
                          <div className="flex-1" />
                          {!hasClassFreeSpot(c) && (
                            <Chip
                              className={"sm:hidden"}
                              color="danger"
                              size="md"
                            >
                              Vyprodáno
                            </Chip>
                          )}
                          {hasClassFreeSpot(c) && (
                            <span className="float-right mt-1.5 sm:mt-1 mr-4 text-small sm:text-medium">
                              {c?.classType?.price} Kč
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:block me-6">
                        {hasClassFreeSpot(c) && (
                          <Button
                            as="span"
                            color="primary"
                            size="md"
                            variant="solid"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClass(c);
                            }}
                          >
                            Rezervovat
                          </Button>
                        )}
                        {!hasClassFreeSpot(c) && (
                          <Button
                            isDisabled
                            as="span"
                            className={"hidden sm:inline-flex"}
                            color="danger"
                          >
                            Vyprodáno
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Reservation form */}
      <section
        className={
          "w-full px-2 max-w-3xl " +
          (determineStep() === 4 ? "shown" : "hidden")
        }
      >
        <div>
          <Link
            isBlock
            className="absolute mt-6 hover:cursor-pointer !text-xl text-center font-bold"
            color={"foreground"}
            onPress={() => setSelectedClass(null)}
          >
            <Icon className="inline-block me-2" icon={"weui:back-filled"} />
          </Link>
          <h2 className="text-xl text-center font-bold pt-6">
            {isHydrated
              ? new Date(selectedClass?.date ?? 0).toLocaleDateString("cs-CZ", {
                  weekday: "long",
                })
              : ""}{" "}
            {isHydrated
              ? new Date(selectedClass?.date ?? 0).toLocaleDateString("cs-CZ")
              : ""}{" "}
            v {selectedClass?.time}
          </h2>
        </div>

        <div className=" flex my-6 gap-3 sm:gap-6 items-start sm:items-center flex-col sm:flex-row">
          <div className=" ml-4 sm:ml-0 lg:absolute lg:ml-[-5rem] items-center flex flex-row sm:flex-col gap-2 justify-center lg:w-14">
            <b>{selectedClass?.time}</b>
            <span className="text-tiny">
              {selectedClass?.classType.duration} min
            </span>
          </div>
          <Card
            key={selectedClass?.id}
            isPressable
            className="hover:shadow-lg transition-shadow duration-200 flex-1"
          >
            <CardBody className="flex flex-row sm:flex-row  gap-3 p-0 min-h-36 ">
              <Image
                alt={selectedClass?.classType.name}
                className=" w-28 sm:w-36 rounded-none object-cover h-full"
                src={selectedClass?.classType.image as any}
              />
              <div className="flex-1 self-center h-full flex flex-col justify-between py-2 pe-2">
                <div>
                  <h3 className="text-md font-semibold">
                    {selectedClass?.classType.name}
                  </h3>
                  <p className="text-small  text-justify pe-3">
                    {selectedClass?.classType.description}
                  </p>
                </div>
                <div>
                  <Avatar
                    alt={selectedClass?.trainer?.name}
                    className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                    size="sm"
                    src={selectedClass?.trainer?.profilePicture as any}
                  />
                  <span className="text-small sm:text-medium">
                    {selectedClass?.trainer?.name}
                  </span>

                  {selectedClass?.secondTrainer && (
                    <div className="inline-block ml-4">
                      <Avatar
                        alt={selectedClass?.secondTrainer?.name}
                        className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                        size="sm"
                        src={
                          selectedClass?.secondTrainer?.profilePicture as any
                        }
                      />
                      <span className="text-small sm:text-medium">
                        {selectedClass?.secondTrainer?.name}
                      </span>
                    </div>
                  )}
                  <span className="float-right mt-1.5 sm:mt-1 mr-4 text-small sm:text-medium">
                    {selectedClass?.classType?.price} Kč
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="p-2 mt-8">
          <CardBody>
            <Form
              validationBehavior="native"
              onSubmit={(e) => handleReservationSubmit(e)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="relative text-foreground-500">
                  Osobní údaje
                </span>
              </div>
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  isRequired
                  autoComplete="firstName"
                  label="Jméno"
                  labelPlacement="outside"
                  name="firstName"
                  placeholder="Zadejte jméno"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleFormFieldChange("firstName", e.target.value)
                  }
                />
                <Input
                  isRequired
                  autoComplete="lastName"
                  label="Příjmení"
                  labelPlacement="outside"
                  name="lastName"
                  placeholder="Zadejte příjmení"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleFormFieldChange("lastName", e.target.value)
                  }
                />
                <Input
                  isRequired
                  autoComplete="email"
                  label="Email"
                  labelPlacement="outside"
                  name="email"
                  placeholder="Zadejte email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleFormFieldChange("email", e.target.value)
                  }
                />
                {/* Phone Number */}
                <Input
                  isRequired
                  autoComplete="tel"
                  label="Telefonní číslo"
                  labelPlacement="outside"
                  name="phone"
                  placeholder="Zadejte telefonní číslo"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleFormFieldChange("phone", e.target.value)
                  }
                />
              </div>

              <span className="relative text-foreground-500 pt-6">
                Platební metoda
              </span>
              <PaymentMethodRadioGroup
                allowOsobne={!disableOnsite}
                allowQr={allowQr}
                defaultValue={disableOnsite ? "credit_card" : null}
                value={disableOnsite ? "credit_card" : formData.paymentMethod}
                onChange={(value) =>
                  handleFormFieldChange(
                    "paymentMethod",
                    typeof value === "string" ? value : value.target.value,
                  )
                }
              />

              <span className="relative text-foreground-500 pt-6">
                Fakturační adresa
              </span>
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  isRequired
                  label="Ulice a číslo popisné"
                  labelPlacement="outside"
                  name="address"
                  placeholder="Hlavní 123"
                  value={formData.address}
                  onChange={(e) =>
                    handleFormFieldChange("address", e.target.value)
                  }
                />
                <Input
                  isRequired
                  label="Město"
                  labelPlacement="outside"
                  name="city"
                  placeholder="Praha"
                  value={formData.city}
                  onChange={(e) =>
                    handleFormFieldChange("city", e.target.value)
                  }
                />
                <Input
                  isRequired
                  label="PSČ"
                  labelPlacement="outside"
                  name="postalCode"
                  placeholder="11000"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleFormFieldChange("postalCode", e.target.value)
                  }
                />
                <Input
                  isRequired
                  label="Země"
                  labelPlacement="outside"
                  name="country"
                  placeholder="Česká republika"
                  value={formData.country}
                  onChange={(e) =>
                    handleFormFieldChange("country", e.target.value)
                  }
                />
              </div>

              <div className="pt-6 flex w-full justify-end gap-2">
                <Button color="primary" isLoading={isSubmitting} type="submit">
                  Odeslat rezervaci
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </section>

      {/* Thank You page */}
      <section
        className={
          "w-full px-2 max-w-3xl " +
          (determineStep() === 5 ? "shown" : "hidden")
        }
      >
        <div className="flex flex-col items-center justify-center gap-4 pt-20">
          <Image
            alt="Děkujeme za vaši rezervaci!"
            className="w-72 h-72 rounded-full object-cover"
            src={
              selectedClass?.trainer.profilePicture ??
              "/photos/trainers/martina.jpg"
            }
          />

          <h1 className="text-4xl text-center font-bold pt-4 pb-2">
            Děkujeme za vaši rezervaci!
          </h1>
          <p className="text-lg text-center">
            Vaše rezervace na lekci <b>{selectedClass?.classType.name}</b> dne{" "}
            <b>
              {isHydrated
                ? new Date(selectedClass?.date ?? -1).toLocaleDateString(
                    "cs-CZ",
                    {
                      weekday: "long",
                    },
                  )
                : ""}{" "}
              {isHydrated
                ? new Date(selectedClass?.date ?? -1).toLocaleDateString(
                    "cs-CZ",
                  )
                : ""}{" "}
              v {selectedClass?.time}
            </b>{" "}
            byla úspěšně odeslána. Těšíme se na vás, tým BeBrave.
          </p>
        </div>
      </section>
    </div>
  );
}

const ReservationPageNoSSR = dynamic(() => Promise.resolve(ReservationPage), {
  ssr: false,
});

export default ReservationPageNoSSR;
