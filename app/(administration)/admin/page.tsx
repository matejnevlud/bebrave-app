"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  DatePicker,
  Form,
  Modal,
  ModalContent,
  NumberInput,
  Select,
  SelectItem,
  Spinner,
  TimeInput,
  useDisclosure,
} from "@heroui/react";
import { SVGProps } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
} from "@heroui/react";
import {
  getLocalTimeZone,
  parseDate,
  parseTime,
  today,
} from "@internationalized/date";
import { Button } from "@heroui/button";
import { ModalBody, ModalHeader } from "@heroui/modal";
import { I18nProvider } from "@react-aria/i18n";

import {
  getClassById,
  getClasses,
  getClassTypes,
  getOlderClasses,
  getTrainers,
  updateClass,
  cancelReservation,
} from "@/db/actions";
import {
  Class,
  ClassType,
  ClassWithRelations,
  TrainerWithRelations,
} from "@/db/schema";
import { isSuperAdmin } from "@/lib/auth";

type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
];

const EyeIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

const DeleteIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

const EditIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};
const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type User = (typeof users)[0];

/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */

export default function AdminPage() {
  let now = today(getLocalTimeZone());
  const [trainers, setTrainers] = useState<TrainerWithRelations[]>([]);
  const trainersKeyValueArray = useMemo(() => {
    return trainers.map((trainer) => ({
      key: trainer.id.toString(),
      value: trainer.name,
    }));
  }, [trainers]);

  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const classTypesKeyValueArray = useMemo(() => {
    return classTypes.map((classType) => ({
      key: classType.id.toString(),
      value: classType.name,
    }));
  }, [classTypes]);

  const [classes, setClasses] = useState<ClassWithRelations[]>([]);

  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [isLoadingOlderClasses, setIsLoadingOlderClasses] =
    useState<boolean>(false);
  const [hasOlderClasses, setHasOlderClasses] = useState<boolean>(true);
  const [refundingReservationId, setRefundingReservationId] = useState<
    number | null
  >(null);

  async function fetchData() {
    const t = await getTrainers();
    const ct = await getClassTypes();
    const c = await getClasses(1, true);

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
  }, []);

  async function loadOlderClasses() {
    const oldestClass = classes[0];

    if (!oldestClass || isLoadingOlderClasses) return;

    setIsLoadingOlderClasses(true);

    try {
      const olderClasses = await getOlderClasses(
        oldestClass.date,
        oldestClass.time,
        oldestClass.id,
        true,
      );

      setClasses((currentClasses) => [
        ...olderClasses.classes,
        ...currentClasses,
      ]);
      setHasOlderClasses(olderClasses.hasMore);
    } catch (error) {
      console.error("Error loading older classes:", error);
      alert("Starší lekce se nepodařilo načíst. Zkuste to prosím znovu.");
    } finally {
      setIsLoadingOlderClasses(false);
    }
  }

  async function refreshSelectedClass() {
    if (!selectedClass) return;

    const updatedClass = await getClassById(selectedClass.id);

    if (!updatedClass) return;

    setSelectedClass(updatedClass);
    setClasses((currentClasses) =>
      currentClasses.map((classItem) =>
        classItem.id === updatedClass.id ? updatedClass : classItem,
      ),
    );
  }

  const lastClassInEachDay = useMemo(() => {
    if (classes.length === 0) return [];

    const groupedByDate = classes.reduce(
      (acc, c) => {
        const date = new Date(c.date).toLocaleDateString("cs-CZ");

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(c);

        return acc;
      },
      {} as Record<string, ClassWithRelations[]>,
    );

    const lastClasses = Object.entries(groupedByDate).map(
      ([date, classList]) => {
        const lastClass = classList
          .sort(
            (a, b) =>
              new Date(a.date + "T" + a.time).getTime() -
              new Date(b.date + "T" + b.time).getTime(),
          )
          .pop();

        //return { ...lastClass, date };
        return lastClass?.id ?? -1;
      },
    );

    console.log("Last classes in each day:", lastClasses);

    return lastClasses;
  }, [classes]);

  const [selectedClass, setSelectedClass] = useState<ClassWithRelations>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function openReservationModal(c: ClassWithRelations) {
    setSelectedClass(c);
    onOpen();
  }

  async function saveClassChanges(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.currentTarget));

    console.log(data);

    // create class like object partial
    const updatedClass: Partial<Class> = {
      id: selectedClass?.id,
      date: data.date as string,
      time: (data.time as string).substring(0, 5), // Ensure time is in HH:MM format
      capacity: Number(data.capacity),
      classTypeId: Number(data.classTypeId),
      trainerId: Number(data.trainerId),
      secondTrainerId: data.secondTrainerId
        ? Number(data.secondTrainerId)
        : null,
    };

    console.log("Updated class data:", updatedClass);

    const fetchedClass = await updateClass(selectedClass?.id, updatedClass);

    console.log("Updated class:", fetchedClass);
    setSelectedClass(fetchedClass as ClassWithRelations);

    //@ts-ignore
    setClasses((prevClasses) => {
      return prevClasses.map((c) =>
        c.id === fetchedClass?.id ? fetchedClass : c,
      );
    });
  }

  async function handleCancelReservation(reservationId: number) {
    if (!confirm("Opravdu chcete zrušit tuto rezervaci?")) {
      return;
    }

    try {
      const success = await cancelReservation(reservationId);

      if (success) {
        await refreshSelectedClass();
      } else {
        alert("Nepodařilo se zrušit rezervaci. Zkuste to prosím znovu.");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Došlo k chybě při rušení rezervace. Zkuste to prosím znovu.");
    }
  }

  async function handleRefundReservation(reservationId: number) {
    setRefundingReservationId(reservationId);

    try {
      const availabilityResponse = await fetch(
        `/api/admin/reservations/${reservationId}/refund`,
        { cache: "no-store" },
      );
      const availability = (await availabilityResponse.json()) as {
        currency?: string;
        error?: string;
        maxAmount?: number;
        minAmount?: number;
      };

      if (availabilityResponse.status === 403) {
        throw new Error(
          "Vaše přihlášení vypršelo. Přihlaste se prosím znovu jako admin.",
        );
      }

      if (!availabilityResponse.ok) {
        throw new Error(availability.error || "Refund is not available");
      }

      const maxAmount = availability.maxAmount || 0;
      const minAmount = availability.minAmount || 1;
      const enteredAmount = prompt(
        `Částka k vrácení v ${availability.currency || "CZK"}:`,
        (maxAmount / 100).toFixed(2),
      );

      if (enteredAmount === null) return;

      const normalizedAmount = enteredAmount.trim().replace(",", ".");

      if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) {
        throw new Error(
          "Zadejte platnou částku s nejvýše dvěma desetinnými místy.",
        );
      }

      const amount = Math.round(Number(normalizedAmount) * 100);

      if (amount < minAmount || amount > maxAmount) {
        throw new Error(
          `Částka musí být mezi ${(minAmount / 100).toFixed(2)} a ${(maxAmount / 100).toFixed(2)} ${availability.currency || "CZK"}.`,
        );
      }

      if (
        !confirm(
          `Opravdu chcete přes XPay vrátit ${(amount / 100).toFixed(2)} ${availability.currency || "CZK"}?`,
        )
      ) {
        return;
      }

      const refundRequestStorageKey = `xpay-refund-${reservationId}-${amount}`;
      const requestId =
        sessionStorage.getItem(refundRequestStorageKey) || crypto.randomUUID();

      sessionStorage.setItem(refundRequestStorageKey, requestId);

      const refundResponse = await fetch(
        `/api/admin/reservations/${reservationId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            requestId,
          }),
        },
      );
      const refundResult = (await refundResponse.json()) as {
        error?: string;
        operationId?: string;
        status?: string;
      };

      if (refundResponse.status === 403) {
        throw new Error(
          "Vaše přihlášení vypršelo. Přihlaste se prosím znovu jako admin.",
        );
      }

      if (!refundResponse.ok && refundResponse.status !== 202) {
        throw new Error(refundResult.error || "Refund failed");
      }

      sessionStorage.removeItem(refundRequestStorageKey);

      if (refundResponse.status === 202) {
        alert(
          `XPay refund byl přijat a čeká na dokončení. Operace: ${refundResult.operationId || "neuvedena"}`,
        );
      } else {
        alert("Platba byla úspěšně vrácena přes XPay.");
      }

      await refreshSelectedClass();
    } catch (error) {
      console.error("Error refunding reservation:", error);
      alert(
        error instanceof Error ? error.message : "Platbu se nepodařilo vrátit.",
      );
    } finally {
      setRefundingReservationId(null);
    }
  }

  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {user.team}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <div>
      <Table
        removeWrapper
        aria-label="Example table with custom cells"
        className="hidden"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={users}>
          {(item) => (
            <TableRow
              key={item.id}
              className="hover:bg-default-100 cursor-pointer"
              onClick={() => console.log(item.id)}
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mb-4 flex justify-start">
        <Button
          isDisabled={isFetchingData || !hasOlderClasses}
          isLoading={isLoadingOlderClasses}
          variant="bordered"
          onPress={loadOlderClasses}
        >
          {hasOlderClasses
            ? "Načíst starší"
            : "Všechny starší lekce jsou načtené"}
        </Button>
      </div>

      <Table removeWrapper aria-label="Přehled lekcí" rowHeight={80}>
        <TableHeader>
          <TableColumn>ČAS</TableColumn>
          <TableColumn>NÁZEV LEKCE</TableColumn>
          <TableColumn>TRENÉR</TableColumn>
          <TableColumn>OBSAZENOST</TableColumn>
          <TableColumn align="end"> </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"Žádné lekce k zobrazení"}
          isLoading={isFetchingData}
          items={classes}
          loadingContent={<Spinner label="Načítám..." />}
        >
          {(item) => (
            <TableRow
              key={item.id}
              className={
                "h-[4.5rem] hover:bg-default-100 cursor-pointer" +
                (lastClassInEachDay.includes(item.id)
                  ? "  border-b-gray-200  border-b-1.5"
                  : "") +
                (item.deletedAt ? " opacity-50 grayscale" : "")
              }
              onClick={() => openReservationModal(item)}
            >
              <TableCell>
                <b>
                  {new Date(item.date).toLocaleDateString("cs-CZ", {
                    weekday: "long",
                  })}{" "}
                  {new Date(item.date).toLocaleDateString()}
                </b>
                <br />
                <span className="text-tiny">
                  {item.time}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                <span className="text-tiny">
                  ({item.classType.duration} min)
                </span>
              </TableCell>

              <TableCell>
                <Avatar
                  alt={item.classType?.name}
                  className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                  size="md"
                  src={item.classType?.image as any}
                />
                <b className={item.deletedAt ? "line-through" : ""}>
                  {item.classType?.name}
                </b>
                {item.deletedAt && (
                  <Chip className="ml-2" size="sm" variant="flat">
                    Zrušeno
                  </Chip>
                )}
              </TableCell>
              <TableCell>
                <Avatar
                  alt={item.trainer?.name}
                  className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                  size="md"
                  src={item.trainer?.profilePicture as any}
                />
                <span>{item.trainer?.name}</span>
                {item.secondTrainer && (
                  <div className="inline-block ml-4">
                    <Avatar
                      alt={item.secondTrainer?.name}
                      className="inline-flex me-2 hover:scale-125 transition-transform duration-200"
                      size="md"
                      src={item.secondTrainer?.profilePicture as any}
                    />
                    <span>{item.secondTrainer?.name}</span>
                  </div>
                )}
              </TableCell>

              <TableCell>
                {(() => {
                  // Count only confirmed reservations (exclude cancelled and pending_payment)
                  const confirmedReservations =
                    item.reservations?.filter(
                      (r) => r.status === "confirmed",
                    ) || [];
                  const confirmedCount = confirmedReservations.length;

                  return (
                    <Button
                      color={
                        confirmedCount >= 3
                          ? "success"
                          : confirmedCount > 0
                            ? "warning"
                            : undefined
                      }
                      variant={"bordered"}
                      onPress={() => openReservationModal(item)}
                    >
                      {confirmedCount} / {item.capacity}
                    </Button>
                  );
                })()}
              </TableCell>

              <TableCell>
                <Button
                  color="primary"
                  size="md"
                  onPress={() => openReservationModal(item)}
                >
                  Detail
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detail {selectedClass?.classType.name} -{" "}
                {new Date(selectedClass?.date ?? 0).toLocaleDateString(
                  "cs-CZ",
                  { weekday: "long" },
                )}{" "}
                {new Date(selectedClass?.date ?? 0).toLocaleDateString()}
              </ModalHeader>
              <ModalBody>
                <Form
                  className="w-full max-w grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={saveClassChanges}
                >
                  <I18nProvider locale="cs-CZ">
                    <DatePicker
                      isRequired
                      defaultValue={
                        parseDate(selectedClass?.date ?? "") ?? undefined
                      }
                      hourCycle={24}
                      label="Datum"
                      labelPlacement="outside"
                      name="date"
                    />
                  </I18nProvider>
                  <TimeInput
                    isRequired
                    defaultValue={parseTime(selectedClass?.time ?? "00:00")}
                    granularity={"minute"}
                    hourCycle={24}
                    label="Čas"
                    labelPlacement="outside"
                    name="time"
                  />

                  <NumberInput
                    isRequired
                    defaultValue={selectedClass?.capacity}
                    formatOptions={{
                      style: "decimal",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    label="Kapacita lekce"
                    labelPlacement="outside"
                    maxValue={100}
                    minValue={1}
                    name="capacity"
                  />

                  <Select
                    isRequired
                    defaultSelectedKeys={
                      selectedClass?.classType?.id
                        ? [selectedClass.classType.id.toString()]
                        : undefined
                    }
                    items={classTypesKeyValueArray}
                    label="Typ lekce"
                    labelPlacement="outside"
                    name="classTypeId"
                    placeholder="Vyberte ze seznamu"
                  >
                    {(classTypeKV) => (
                      <SelectItem>{classTypeKV.value}</SelectItem>
                    )}
                  </Select>

                  <Select
                    isRequired
                    defaultSelectedKeys={
                      selectedClass?.trainerId
                        ? [selectedClass.trainerId.toString()]
                        : undefined
                    }
                    items={trainersKeyValueArray}
                    label="Trenér"
                    labelPlacement="outside"
                    name="trainerId"
                    placeholder="Vyberte ze seznamu"
                  >
                    {(trainerKV) => <SelectItem>{trainerKV.value}</SelectItem>}
                  </Select>

                  <Select
                    defaultSelectedKeys={
                      selectedClass?.secondTrainerId
                        ? [selectedClass.secondTrainerId.toString()]
                        : undefined
                    }
                    items={trainersKeyValueArray}
                    label="Druhý trenér"
                    labelPlacement="outside"
                    name="secondTrainerId"
                    placeholder="Vyberte ze seznamu"
                  >
                    {(trainerKV) => <SelectItem>{trainerKV.value}</SelectItem>}
                  </Select>

                  <div className="col-span-2">
                    <Button
                      className="col-span-full"
                      color="success"
                      type="submit"
                    >
                      Uložit změny
                    </Button>
                  </div>
                </Form>

                <Table
                  removeWrapper
                  aria-label="Example empty table"
                  className="mt-8"
                  rowHeight={80}
                >
                  <TableHeader>
                    <TableColumn>Klient</TableColumn>
                    <TableColumn>Datum rezervace</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Platba</TableColumn>
                    <TableColumn>Akce</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={"Žádné rezervace k zobrazení"}
                    items={selectedClass?.reservations || []}
                  >
                    {(item) => (
                      <TableRow
                        key={item.id}
                        className="h-[4.5rem] hover:bg-default-100 cursor-pointer"
                      >
                        <TableCell className="flex-col flex gap-2">
                          <span className="font-medium text-medium">
                            {item.firstName} {item.lastName}
                          </span>
                          <span className="text-small">{item.phone}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-medium">
                            {new Date(item.createdAt ?? 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={
                              item.status === "confirmed"
                                ? "success"
                                : item.status === "cancelled"
                                  ? "danger"
                                  : item.status === "pending_payment"
                                    ? "warning"
                                    : "default"
                            }
                            size="sm"
                            variant="flat"
                          >
                            {item.status === "confirmed"
                              ? "Potvrzeno"
                              : item.status === "cancelled"
                                ? "Zrušeno"
                                : item.status === "pending_payment"
                                  ? "Čeká na platbu"
                                  : item.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Chip
                              color={
                                item.paymentStatus === "completed"
                                  ? "success"
                                  : item.paymentStatus === "refunded"
                                    ? "default"
                                    : item.paymentStatus ===
                                        "partially_refunded"
                                      ? "warning"
                                      : item.paymentStatus === "failed"
                                        ? "danger"
                                        : item.paymentStatus === "cancelled"
                                          ? "danger"
                                          : item.paymentStatus === "pending"
                                            ? "warning"
                                            : "default"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {item.paymentStatus === "completed"
                                ? "Uhrazeno"
                                : item.paymentStatus === "refunded"
                                  ? "Vráceno"
                                  : item.paymentStatus === "partially_refunded"
                                    ? "Částečně vráceno"
                                    : item.paymentStatus === "failed"
                                      ? "Neúspěšná"
                                      : item.paymentStatus === "cancelled"
                                        ? "Zrušena"
                                        : item.paymentStatus === "pending"
                                          ? "Čeká"
                                          : item.paymentStatus}
                            </Chip>
                            {item.paymentMethod && (
                              <span className="text-tiny text-default-500">
                                {item.paymentMethod === "credit_card"
                                  ? "Karta"
                                  : item.paymentMethod === "qr_payment"
                                    ? "QR platba"
                                    : item.paymentMethod === "on_site"
                                      ? "Na místě"
                                      : item.paymentMethod === "customer_credit"
                                        ? "Kredit"
                                        : item.paymentMethod}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {isSuperAdmin() &&
                              item.paymentMethod === "credit_card" &&
                              (item.paymentStatus === "completed" ||
                                item.paymentStatus ===
                                  "partially_refunded") && (
                                <Button
                                  color="warning"
                                  isLoading={refundingReservationId === item.id}
                                  size="sm"
                                  variant="flat"
                                  onPress={() =>
                                    handleRefundReservation(item.id)
                                  }
                                >
                                  Vrátit platbu
                                </Button>
                              )}
                            {item.status === "confirmed" && (
                              <Button
                                color="danger"
                                size="sm"
                                variant="flat"
                                onPress={() => handleCancelReservation(item.id)}
                              >
                                Zrušit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
