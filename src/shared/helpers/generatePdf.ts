import { PDFDocument } from "pdf-lib";
import { Venue } from "../types";
import fontkit from "@pdf-lib/fontkit";

export const generatePDF = async (venue: Venue) => {
    if (!venue) return;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    const fontSize = 15;
    const lineSpacing = 30; // Spacing between text lines
    const margin = 50; // Left margin
    const imageMargin = 20; // Margin between text and image

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Load Roboto font
    let robotoFont;
    try {
        const fontUrl = "/fonts/Roboto-Regular.ttf";
        const fontBytes = await fetch(fontUrl).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
            return res.arrayBuffer();
        });
        robotoFont = await pdfDoc.embedFont(fontBytes);
    } catch (err) {
        console.error("Error loading font:", err);
        robotoFont = await pdfDoc.embedFont("Helvetica");
    }

    // Load image if image_url exists
    let image;
    if (venue.image_url) {
        try {
            const imageResponse = await fetch(venue.image_url);
            if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);
            const imageBytes = await imageResponse.arrayBuffer();
            const contentType = imageResponse.headers.get("content-type");
            if (contentType?.includes("image/png")) {
                image = await pdfDoc.embedPng(imageBytes);
            } else if (contentType?.includes("image/jpeg")) {
                image = await pdfDoc.embedJpg(imageBytes);
            } else {
                throw new Error(`Unsupported image type: ${contentType}`);
            }
        } catch (err) {
            console.error("Error loading image:", err);
        }
    }

    // Draw text with font
    let currentY = height - margin;
    page.drawText(`Name: ${venue.name}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;
    page.drawText(`Address: ${venue.address}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;
    page.drawText(`Capacity: ${venue.capacity}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;
    page.drawText(`Phone: ${venue.phone || "N/A"}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;
    page.drawText(`Created: ${new Date(venue.created_at).toLocaleDateString()}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;
    page.drawText(`Event Date: ${venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}`, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: robotoFont,
    });
    currentY -= lineSpacing;

    // Draw image if loaded
    if (image) {
        const imgWidth = 200;
        const imgHeight = (image.height / image.width) * imgWidth;
        // Place image below text with margin
        const imageY = currentY - imageMargin - imgHeight;
        if (imageY > margin) {
            // Ensure image fits on page
            page.drawImage(image, {
                x: margin,
                y: imageY,
                width: imgWidth,
                height: imgHeight,
            });
        } else {
            console.warn("Image does not fit on page");
            page.drawText("Image: Too large to display", {
                x: margin,
                y: currentY - imageMargin,
                size: fontSize,
                font: robotoFont,
            });
        }
    } else {
        page.drawText("Image: N/A", {
            x: margin,
            y: currentY - imageMargin,
            size: fontSize,
            font: robotoFont,
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${venue.name}.pdf`;
    link.click();
};
