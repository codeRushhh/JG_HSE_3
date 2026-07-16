// Turns the on-screen printable report (the element with class "print-report")
// into a PDF and opens the device's native share sheet (WhatsApp, email, etc.)
// so a completed report can be sent straight from the phone.
//
// Falls back to downloading the PDF if the browser/device doesn't support
// sharing files (e.g. most desktop browsers), so the person can still attach
// it manually.
export async function shareReportPdf({ elementSelector = ".print-report", filename = "report.pdf", title = "HSE Report" } = {}) {
  const target = document.querySelector(elementSelector);
  if (!target) {
    alert("Could not find the report to share.");
    return;
  }

  let html2canvas, jsPDF;
  try {
    html2canvas = (await import("html2canvas")).default;
    ({ jsPDF } = await import("jspdf"));
  } catch (e) {
    alert("Sharing needs the app to be rebuilt with the html2canvas dependency installed (npm install).");
    return;
  }

  const safeName = (filename || "report.pdf").replace(/[^a-z0-9._-]+/gi, "_");

  let pdfBlob;
  try {
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdfBlob = pdf.output("blob");

    // Try native share first (this is what puts WhatsApp/Email/etc. on screen)
    const file = new File([pdfBlob], safeName, { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title });
        return;
      } catch (shareErr) {
        if (shareErr && shareErr.name === "AbortError") return; // person cancelled the share sheet
        // otherwise fall through to the download fallback below
      }
    }
  } catch (e) {
    alert("Could not prepare the report for sharing. Please try Print/Save instead.");
    return;
  }

  // Fallback for browsers/devices without file-sharing support: download the
  // PDF so it can be attached manually in WhatsApp, email, etc.
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  alert("Sharing isn't supported on this browser, so the PDF was downloaded instead — you can attach it in WhatsApp/Email manually.");
}
