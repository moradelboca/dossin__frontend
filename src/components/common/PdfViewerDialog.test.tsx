import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PdfViewerDialog from "./PdfViewerDialog";

describe("PdfViewerDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza iframe cuando open y blob existen", () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:mock"),
    });

    render(
      <PdfViewerDialog open title="Mi PDF" blob={blob} onClose={() => {}} />
    );

    const iframe = screen.getByTitle("Mi PDF");
    expect(iframe).toBeInTheDocument();
  });

  it("revoca objectURL al unmount", () => {
    const blob = new Blob([new Uint8Array([1])], { type: "application/pdf" });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:mock"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(() => {}),
    });

    const { unmount } = render(
      <PdfViewerDialog open title="Mi PDF" blob={blob} onClose={() => {}} />
    );

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});

