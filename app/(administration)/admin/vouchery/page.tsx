"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Select,
  SelectItem,
  NumberInput,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { DatePicker } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";

import {
  generateVouchers,
  getClassTypes,
  getVouchers,
  getVoucherStats,
  markVoucherRedeemedInSlevomat,
  updateClassTypesVoucherEligibility,
} from "@/db/actions";
import { ClassType, Voucher } from "@/db/schema";

type VoucherWithDetails = Voucher & {
  classType?: ClassType;
  reservation?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    class?: {
      date: string;
      time: string;
      classType?: ClassType;
    } | null;
  } | null;
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherWithDetails[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    used: 0,
    expired: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingEligibility, setIsSavingEligibility] = useState(false);
  const [isMarkingSlevomatVoucherId, setIsMarkingSlevomatVoucherId] = useState<
    number | null
  >(null);
  const [generateCount, setGenerateCount] = useState<number>(10);
  const [selectedClassType, setSelectedClassType] = useState<string>("all");
  const [ineligibleClassTypes, setIneligibleClassTypes] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [voucherData, classTypeData, statsData] = await Promise.all([
        getVouchers(),
        getClassTypes(),
        getVoucherStats(),
      ]);

      setVouchers(voucherData as VoucherWithDetails[]);
      setClassTypes(classTypeData as ClassType[]);
      setStats(statsData);

      const ineligible = (classTypeData as ClassType[])
        .filter((ct) => !ct.isVoucherEligible)
        .map((ct) => ct.id.toString());

      setIneligibleClassTypes(new Set(ineligible));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveEligibility() {
    setIsSavingEligibility(true);
    try {
      const ineligibleIds = Array.from(ineligibleClassTypes).map((id) =>
        parseInt(id, 10),
      );

      await updateClassTypesVoucherEligibility(ineligibleIds);
      await fetchData();
    } catch (error) {
      console.error("Error saving eligibility:", error);
      alert("Nepodařilo se uložit nastavení");
    } finally {
      setIsSavingEligibility(false);
    }
  }

  async function handleGenerateVouchers(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const formData = new FormData(e.currentTarget);
      const count = parseInt(formData.get("count") as string, 10);
      const classTypeId =
        formData.get("classTypeId") === "all"
          ? null
          : parseInt(formData.get("classTypeId") as string, 10);
      const validFrom = new Date(formData.get("validFrom") as string);
      const validUntil = new Date(formData.get("validUntil") as string);

      await generateVouchers(count, classTypeId, validFrom, validUntil);
      await fetchData();
    } catch (error) {
      console.error("Error generating vouchers:", error);
      alert("Nepodařilo se vygenerovat vouchery");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleMarkRedeemedInSlevomat(voucherId: number) {
    setIsMarkingSlevomatVoucherId(voucherId);
    try {
      const success = await markVoucherRedeemedInSlevomat(voucherId);

      if (!success) {
        alert("Voucher se nepodařilo označit jako odeslaný do Slevomatu");
      }

      await fetchData();
    } catch (error) {
      console.error("Error marking voucher as redeemed in Slevomat:", error);
      alert("Voucher se nepodařilo označit jako odeslaný do Slevomatu");
    } finally {
      setIsMarkingSlevomatVoucherId(null);
    }
  }

  const usedVouchers = vouchers.filter((voucher) => voucher.status === "used");
  const unusedVouchers = vouchers.filter(
    (voucher) => voucher.status !== "used",
  );

  const now = today(getLocalTimeZone());
  const sixMonthsLater = now.add({ months: 6 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Správa voucherů</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-500">Celkem</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-success">Dostupné</p>
            <p className="text-2xl font-bold text-success">{stats.available}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-400">Použité</p>
            <p className="text-2xl font-bold">{stats.used}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-danger">Expirované</p>
            <p className="text-2xl font-bold text-danger">{stats.expired}</p>
          </CardBody>
        </Card>
      </div>

      <Divider />

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-2">Využití voucherů</h2>
          <p className="text-sm text-default-500 mb-4">
            Vyberte typy lekcí, které nelze platit voucherem
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <Select
              className="flex-1"
              items={classTypes}
              label="Zakázané typy lekcí"
              labelPlacement="outside"
              placeholder="Vyberte typy lekcí"
              selectedKeys={ineligibleClassTypes}
              selectionMode="multiple"
              onSelectionChange={(keys) =>
                setIneligibleClassTypes(new Set(Array.from(keys).map(String)))
              }
            >
              {(item) => (
                <SelectItem
                  key={item.id}
                  selectedIcon={
                    <span className="text-success text-lg font-bold">✓</span>
                  }
                >
                  <span
                    className={
                      ineligibleClassTypes.has(item.id.toString())
                        ? "font-semibold text-danger"
                        : ""
                    }
                  >
                    {item.name}
                  </span>
                </SelectItem>
              )}
            </Select>
            <Button
              className="md:self-end"
              color="primary"
              isLoading={isSavingEligibility}
              onPress={handleSaveEligibility}
            >
              Uložit nastavení
            </Button>
          </div>
        </CardBody>
      </Card>

      <Divider />

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">
            Generovat nové vouchery
          </h2>
          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
            onSubmit={handleGenerateVouchers}
          >
            <NumberInput
              isRequired
              label="Počet"
              labelPlacement="outside"
              maxValue={500}
              minValue={1}
              name="count"
              value={generateCount}
              onValueChange={setGenerateCount}
            />

            <Select
              items={[
                { id: "all", name: "Všechny typy lekcí" },
                ...classTypes.map((ct) => ({
                  id: ct.id.toString(),
                  name: ct.name,
                })),
              ]}
              label="Typ lekce"
              labelPlacement="outside"
              name="classTypeId"
              placeholder="Všechny typy"
              selectedKeys={new Set([selectedClassType])}
              onSelectionChange={(keys) =>
                setSelectedClassType(Array.from(keys)[0] as string)
              }
            >
              {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
            </Select>

            <I18nProvider locale="cs-CZ">
              <DatePicker
                isRequired
                defaultValue={now}
                label="Platnost od"
                labelPlacement="outside"
                name="validFrom"
              />
            </I18nProvider>

            <I18nProvider locale="cs-CZ">
              <DatePicker
                isRequired
                defaultValue={sixMonthsLater}
                label="Platnost do"
                labelPlacement="outside"
                name="validUntil"
              />
            </I18nProvider>

            <Button
              className="self-end"
              color="primary"
              isLoading={isGenerating}
              type="submit"
            >
              Generovat
            </Button>
          </form>
        </CardBody>
      </Card>

      <Divider />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Nepoužité vouchery</h2>
          <Table
            isHeaderSticky
            removeWrapper
            bottomContent={
              isLoading ? (
                <div className="flex w-full justify-center">
                  <p>Načítání...</p>
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>KÓD</TableColumn>
              <TableColumn>TYP LEKCE</TableColumn>
              <TableColumn>STAV</TableColumn>
              <TableColumn>PLATNOST DO</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="Žádné nepoužité vouchery"
              items={unusedVouchers}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <code className="bg-default-100 px-2 py-1 rounded font-mono">
                      {item.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {item.classType?.name || "Všechny typy"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={
                        new Date(item.validUntil) < new Date()
                          ? "danger"
                          : "success"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {new Date(item.validUntil) < new Date()
                        ? "Expirován"
                        : "Dostupný"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {new Date(item.validUntil).toLocaleDateString("cs-CZ")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Použité vouchery</h2>
          <Table isHeaderSticky removeWrapper>
            <TableHeader>
              <TableColumn>KÓD</TableColumn>
              <TableColumn>TYP LEKCE</TableColumn>
              <TableColumn>POUŽITO</TableColumn>
              <TableColumn>POUŽIL</TableColumn>
              <TableColumn>POUŽITO NA LEKCI</TableColumn>
              <TableColumn>SLEVOMAT ODESLÁNO</TableColumn>
              <TableColumn>AKCE</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="Žádné použité vouchery"
              items={usedVouchers}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <code className="bg-default-100 px-2 py-1 rounded font-mono">
                      {item.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {item.classType?.name || "Všechny typy"}
                  </TableCell>
                  <TableCell>
                    {item.usedAt
                      ? new Date(item.usedAt).toLocaleDateString("cs-CZ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {[item.reservation?.firstName, item.reservation?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                      item.reservation?.email ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    {item.reservation?.class
                      ? `${item.reservation.class.classType?.name || "Lekce"} (${item.reservation.class.date} ${item.reservation.class.time})`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.slevomatRedeemedAt
                      ? new Date(item.slevomatRedeemedAt).toLocaleString(
                          "cs-CZ",
                        )
                      : "Neodesláno"}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      isDisabled={Boolean(item.slevomatRedeemedAt)}
                      isLoading={isMarkingSlevomatVoucherId === item.id}
                      size="sm"
                      variant={item.slevomatRedeemedAt ? "flat" : "solid"}
                      onPress={() => handleMarkRedeemedInSlevomat(item.id)}
                    >
                      {item.slevomatRedeemedAt
                        ? "Odesláno"
                        : "Označit jako odesláno"}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
