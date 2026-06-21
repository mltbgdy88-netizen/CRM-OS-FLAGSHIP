import type {
  Customer,
  CustomerAddress,
  CustomerContact,
  CustomerFile,
  CustomerNote,
  CustomerTag,
} from '@prisma/client';

type CustomerDetailRecord = Customer & {
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  tags: CustomerTag[];
  notes: CustomerNote[];
  files: CustomerFile[];
};

export function mapCustomerSummary(customer: Customer) {
  return {
    id: customer.id,
    displayName: customer.displayName,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt?.toISOString() ?? null,
    version: customer.version,
  };
}

export function mapCustomerDetail(customer: CustomerDetailRecord) {
  return {
    ...mapCustomerSummary(customer),
    contacts: customer.contacts.map((contact) => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      title: contact.title,
      isPrimary: contact.isPrimary,
    })),
    addresses: customer.addresses.map((address) => ({
      id: address.id,
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      isPrimary: address.isPrimary,
    })),
    tags: customer.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    notes: customer.notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
    })),
    files: customer.files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      mimeType: file.mimeType,
      byteSize: file.byteSize === null ? null : Number(file.byteSize),
      createdAt: file.createdAt.toISOString(),
    })),
  };
}
