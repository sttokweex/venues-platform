"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import Link from "next/link";
import { Venue } from "@/shared/types";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function VenueDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUserAndFetchVenue = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            if (!id) {
                console.error("No venue ID provided");
                router.push("/");
                return;
            }

            const { data, error } = await supabase.from("venues").select("*").eq("id", id).single();

            if (error) {
                console.error("Error fetching venue:", error);
                router.push("/");
            } else {
                setVenue(data as Venue);
                setLoading(false);
            }
        };

        checkUserAndFetchVenue();
    }, [router, id]);

    const generatePDF = async () => {
        if (!venue) return;

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        const fontSize = 15;
        const lineSpacing = 30;
        const margin = 50;
        const imageMargin = 20;

        pdfDoc.registerFontkit(fontkit);

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

        if (image) {
            const imgWidth = 200;
            const imgHeight = (image.height / image.width) * imgWidth;
            const imageY = currentY - imageMargin - imgHeight;
            if (imageY > margin) {
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

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!venue) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <Link href="/" className="text-blue-500 mb-4 inline-block">
                Back to Home
            </Link>
            <h1 className="text-2xl font-bold mb-4">{venue.name}</h1>
            {venue.image_url && (
                <img src={venue.image_url} alt={venue.name} className="w-full h-64 object-cover mb-4" />
            )}
            <p className="mb-2">Address: ${venue.address}</p>
            <p className="mb-2">Capacity: ${venue.capacity}</p>
            <p className="mb-2">Phone: ${venue.phone || "N/A"}</p>
            <p className="mb-2">Created: ${new Date(venue.created_at).toLocaleDateString()}</p>
            <p className="mb-4">
                Event Date: ${venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}
            </p>
            <button onClick={generatePDF} className="bg-blue-500 text-white px-4 py-2 rounded">
                Download PDF
            </button>
        </div>
    );
}
