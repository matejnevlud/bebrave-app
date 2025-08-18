"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Pagination,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

import { getInvoices, updateInvoiceStatus } from "@/db/actions";
import { nexiPaymentService } from "@/lib/services/nexi";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface Invoice {
  id: number;
  invoiceNumber: number;
  amount: number;
  totalAmount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  description: string;
  issueDate: string;
  dueDate?: string;
  duzp?: string; // Date of taxable supply
  paymentMethod?: string; // Payment method
  reservation: {
    id: number;
    class: {
      classType: {
        name: string;
        price: number;
      };
      trainer: {
        name: string;
      };
      date: string;
      time: string;
    };
    paymentMethod: string;
  };
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const itemsPerPage = 20;
  const totalPages = Math.ceil(total / itemsPerPage);

  // Calculate statistics
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
    pendingInvoices: invoices.filter((inv) => inv.status === "issued").length,
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const result = await getInvoices(page, itemsPerPage, filter);

      setInvoices(result.invoices);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, filter, statusFilter]);

  // Apply status filter
  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === statusFilter);

  // Handle status update
  const handleStatusUpdate = async (invoiceId: number, newStatus: string) => {
    try {
      const success = await updateInvoiceStatus(invoiceId, newStatus);

      if (success) {
        fetchInvoices(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "warning";
      case "paid":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "issued":
        return "Vystavena";
      case "paid":
        return "Uhrazena";
      case "cancelled":
        return "Zrušena";
      default:
        return status;
    }
  };

  // View invoice details
  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  // Download PDF
  const downloadPDF = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `faktura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Nepodařilo se stáhnout PDF fakturu");
    }
  };

  // Dynamically import PDFViewer to avoid SSR issues
  const PDFViewer = dynamic(() => import("./PDFViewer"), { ssr: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faktury</h1>
        <div className="flex gap-4">
          <Select
            className="w-48"
            placeholder="Filtrovat podle stavu"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) =>
              setStatusFilter(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="all">Všechny</SelectItem>
            <SelectItem key="issued">Vystavené</SelectItem>
            <SelectItem key="paid">Uhrazené</SelectItem>
            <SelectItem key="cancelled">Zrušené</SelectItem>
          </Select>
          <Input
            className="w-80"
            placeholder="Hledat podle čísla faktury, jména nebo e-mailu..."
            startContent={
              <Icon className="w-4 h-4" icon="solar:magnifer-linear" />
            }
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Celkem faktur
                </p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
              <Icon
                className="w-8 h-8 text-blue-500"
                icon="solar:file-text-linear"
              />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Celková částka
                </p>
                <p className="text-2xl font-bold">
                  {nexiPaymentService.formatAmount(stats.totalAmount)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">Kč</span>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uhrazené</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.paidInvoices}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingInvoices}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600">⏳</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <Table
            removeWrapper
            aria-label="Tabulka faktur"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>Číslo faktury</TableColumn>
              <TableColumn>Zákazník</TableColumn>
              <TableColumn>Popis</TableColumn>
              <TableColumn>DUZP</TableColumn>
              <TableColumn>Způsob platby</TableColumn>
              <TableColumn>Částka</TableColumn>
              <TableColumn>Stav</TableColumn>
              <TableColumn>Akce</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="Žádné faktury nebyly nalezeny."
              isLoading={loading}
              items={filteredInvoices}
              loadingContent="Načítání faktur..."
            >
              {(invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-mono font-semibold">
                      #{invoice.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">
                        {invoice.customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {invoice.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {invoice.duzp
                        ? new Date(invoice.duzp).toLocaleDateString("cs-CZ")
                        : invoice.reservation.class.date
                          ? new Date(
                              invoice.reservation.class.date,
                            ).toLocaleDateString("cs-CZ")
                          : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {(invoice.paymentMethod ||
                        invoice.reservation.paymentMethod) === "on_site"
                        ? "Na místě"
                        : (invoice.paymentMethod ||
                              invoice.reservation.paymentMethod) ===
                            "credit_card"
                          ? "Karta"
                          : (invoice.paymentMethod ||
                                invoice.reservation.paymentMethod) ===
                              "qr_payment"
                            ? "QR"
                            : (invoice.paymentMethod ||
                                  invoice.reservation.paymentMethod) ===
                                "customer_credit"
                              ? "Kredit"
                              : invoice.paymentMethod ||
                                invoice.reservation.paymentMethod ||
                                "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {nexiPaymentService.formatAmount(invoice.totalAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(invoice.status)}
                      size="sm"
                      variant="flat"
                    >
                      {getStatusText(invoice.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => viewInvoice(invoice)}
                      >
                        <Icon className="w-4 h-4" icon="solar:eye-linear" />
                      </Button>
                      <Button
                        isIconOnly
                        color="secondary"
                        size="sm"
                        variant="light"
                        onPress={() => downloadPDF(invoice.id)}
                      >
                        <Icon
                          className="w-4 h-4"
                          icon="solar:download-linear"
                        />
                      </Button>
                      <Select
                        className="w-32"
                        placeholder="Změnit stav"
                        selectedKeys={[invoice.status]}
                        size="sm"
                        onSelectionChange={(keys) => {
                          const newStatus = Array.from(keys)[0] as string;

                          if (newStatus !== invoice.status) {
                            handleStatusUpdate(invoice.id, newStatus);
                          }
                        }}
                      >
                        <SelectItem key="issued">Vystavena</SelectItem>
                        <SelectItem key="paid">Uhrazena</SelectItem>
                        <SelectItem key="cancelled">Zrušena</SelectItem>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Invoice Details Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" icon="solar:file-text-linear" />
              Faktura #{selectedInvoice?.invoiceNumber}
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedInvoice && (
              <div className="space-y-4">
                {/* Invoice Info Section */}
                <div className="mb-2 space-y-1 text-sm">
                  <div>
                    <strong>DUZP:</strong>{" "}
                    {selectedInvoice.duzp
                      ? new Date(selectedInvoice.duzp).toLocaleDateString(
                          "cs-CZ",
                        )
                      : selectedInvoice.reservation.class.date
                        ? new Date(
                            selectedInvoice.reservation.class.date,
                          ).toLocaleDateString("cs-CZ")
                        : "-"}
                  </div>
                  {selectedInvoice.dueDate && (
                    <div>
                      <strong>Datum splatnosti:</strong>{" "}
                      {new Date(selectedInvoice.dueDate).toLocaleDateString(
                        "cs-CZ",
                      )}
                    </div>
                  )}
                  <div>
                    <strong>Způsob platby:</strong>{" "}
                    {(selectedInvoice.paymentMethod ||
                      selectedInvoice.reservation.paymentMethod) === "on_site"
                      ? "Platba na místě"
                      : (selectedInvoice.paymentMethod ||
                            selectedInvoice.reservation.paymentMethod) ===
                          "credit_card"
                        ? "Kreditní karta"
                        : (selectedInvoice.paymentMethod ||
                              selectedInvoice.reservation.paymentMethod) ===
                            "qr_payment"
                          ? "QR platba"
                          : (selectedInvoice.paymentMethod ||
                                selectedInvoice.reservation.paymentMethod) ===
                              "customer_credit"
                            ? "Kredit zákazníka"
                            : selectedInvoice.paymentMethod ||
                              selectedInvoice.reservation.paymentMethod ||
                              "Nespecifikováno"}
                  </div>
                </div>
                <div className="h-[70vh] w-full">
                  <PDFViewer invoiceId={selectedInvoice.id} />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              startContent={
                <Icon className="w-4 h-4" icon="solar:download-linear" />
              }
              variant="flat"
              onPress={() => selectedInvoice && downloadPDF(selectedInvoice.id)}
            >
              Stáhnout PDF
            </Button>
            <Button color="primary" onPress={onClose}>
              Zavřít
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
