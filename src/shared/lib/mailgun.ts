export async function sendRegistrationEmail(email: string, name: string) {
    console.log("Simulating registration email to:", email);
    console.log("Subject: Welcome to Venue Booking!");
    console.log(`Body: Hello ${name}, thank you for registering!`);
    return { id: "simulated", status: "queued" };
}

export async function sendBookingConfirmationEmail(
    email: string,
    name: string,
    venueName: string,
    startDate: string,
    endDate: string,
    guests: number,
    totalPrice: number
) {
    console.log("Simulating booking confirmation email to:", email);
    console.log("Subject: Your Booking Confirmation");
    console.log(
        `Body: Hello ${name}, your booking for ${venueName} is confirmed!\n\nDetails:\n- Dates: ${new Date(
            startDate
        ).toLocaleString()} to ${new Date(
            endDate
        ).toLocaleString()}\n- Guests: ${guests}\n- Total Price: $${totalPrice}`
    );
    return { id: "simulated", status: "queued" };
}

export async function sendAdminEntityCreationEmail(
    adminEmail: string,
    entityType: string,
    entityDetails: Record<string, any>
) {
    console.log("Simulating admin entity creation email to:", adminEmail);
    console.log(`Subject: New ${entityType} Created`);
    console.log(`Body: A new ${entityType} has been created.\n\nDetails:\n${JSON.stringify(entityDetails, null, 2)}`);
    return { id: "simulated", status: "queued" };
}
