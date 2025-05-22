import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@shared/ui/Button";
import { VenueFormValues } from "../model/types";

interface VenueFormProps {
    initialValues: VenueFormValues;
    onSubmit: (values: VenueFormValues, { resetForm }: { resetForm: () => void }) => void;
    isSubmitting?: boolean;
}

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    address: Yup.string().required("Address is required"),
    capacity: Yup.number().required("Capacity is required").positive().integer(),
    phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
        .required("Phone number is required"),
    image: Yup.mixed()
        .nullable()
        .test("fileType", "Only PNG or JPEG images are allowed", (value) => {
            if (!value) return true;
            return ["image/png", "image/jpeg"].includes((value as File).type);
        }),
    event_date: Yup.date().nullable(),
});

export const VenueForm = ({ initialValues, onSubmit, isSubmitting = false }: VenueFormProps) => {
    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ setFieldValue }) => (
                <Form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <Field
                            name="name"
                            type="text"
                            className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <Field
                            name="address"
                            type="text"
                            className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                            Capacity
                        </label>
                        <Field
                            name="capacity"
                            type="number"
                            className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="capacity" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <Field
                            name="phone"
                            type="text"
                            className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Image
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/png,image/jpeg"
                            className="mt-1 p-2 border rounded-lg w-full"
                            onChange={(event) => {
                                const file = event.currentTarget.files?.[0];
                                setFieldValue("image", file || null);
                            }}
                        />
                        <ErrorMessage name="image" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                        <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                            Event Date
                        </label>
                        <Field
                            name="event_date"
                            type="datetime-local"
                            className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="event_date" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};
