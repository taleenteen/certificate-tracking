# License Document Export

Use the shared export API when an officer needs a downloadable, verifiable
license document. Screens may use any suitable UI pattern: a single action
button, a multi-select dialog, a table bulk action, or an export history list.

## Create an Export

Use the existing client hook:

```tsx
const exportLicense = useLicenseDocumentExport(businessId);

await exportLicense.mutateAsync({
  format: "pdf",
  licenseIds: [licenseId],
});
```

In a regular browser, the hook downloads the binary response. In a Tang Rat
session, it asks the native SDK to save the backend-provided presigned URL first.
If the native bridge is unavailable or rejects the request, it downloads the
same completed export through the BFF instead. The backend validates
the officer, agency scope, ownership conflict, and that all selected licenses
belong to the specified business and one agency.

Available formats:

- `pdf`: printable report with reference number, E-LICENSE source, QR
  verification, establishment data, license data, and certificate media.
- `xlsx`: establishment, license, and document worksheets.
- `csv`: license fields for spreadsheet import; images are not supported by CSV.

Each call creates a new immutable export record, even when the selection is
identical. It stores a content snapshot, SHA-256 checksum, MinIO object key,
reference number, verification code, and audit log row.

## History and Verification

```text
GET /api/officer/license-document-exports?businessId=<uuid>&referenceNo=LEX-...
GET /api/officer/license-document-exports/<exportId>/file
GET /api/public/license-document-exports/<verificationCode>
```

The public verification endpoint returns safe metadata only. It never exposes
the private file or a MinIO object URL.

## UI Rules

- Show creation controls only in officer mode.
- Use one selected license for a compact detail-page action.
- For bulk export, prevent selection across agencies in the UI; the backend
  enforces the same rule.
- Show the export error returned by the API and disable the action while it is
  generating.
- Treat the generated PDF reference number as the support/search identifier.
