import { executePayment, getPaymentStatus } from '../MyFatoorah.js';
import { JsonDB, Config } from 'node-json-db';
const db = new JsonDB(new Config("localdb", true, false, '/'));

const TAG = "MyFatoorah Payment Execute:";

export const myfatoorah_payment_execute = async (req, res, next) => {

    console.log("Awel myfatoorah_payment_execute")
    try {
        console.log("req", req )
        const { body } = req;

        console.log(TAG, "Received request body:", body);

        const {
            CustomerName, CustomerEmail, DisplayCurrencyIso,
            Language, CallBackUrl, ErrorUrl, CustomerReference,
            InvoiceItems, invoiceValue, paymentMethodId, countryId
        } = body;

        console.log(TAG, "Received request body:", body);

        const gatewayExecuteRequest = {
            invoiceValue,
            paymentMethodId,
        };

        const optional = {};

        if (CustomerName) {
            optional.CustomerName = CustomerName;
        }

        if (CustomerEmail) {
            optional.CustomerEmail = CustomerEmail;
        }

        if (DisplayCurrencyIso) {
            optional.DisplayCurrencyIso = DisplayCurrencyIso;
        }

        if (Language) {
            optional.Language = Language;
        }

        if (CallBackUrl) {
            optional.CallBackUrl = CallBackUrl;
        }

        if (ErrorUrl) {
            optional.ErrorUrl = ErrorUrl;
        }

        if (CustomerReference) {
            optional.CustomerReference = CustomerReference;
        }

        if (InvoiceItems) {
            optional.InvoiceItems = InvoiceItems;
        }

        if (Object.keys(optional).length > 0) {
            gatewayExecuteRequest.optional = optional;
        }

        console.log(TAG, "Executing payment with request:", gatewayExecuteRequest);

        const myFatoorahResponse = await executePayment(gatewayExecuteRequest);
        const myFatoorahBody = await myFatoorahResponse.json();

        console.log(TAG, "MyFatoorah response:", myFatoorahBody);

        if (!myFatoorahResponse.ok) {
            console.log(TAG, 'MyFatoorah payment error', myFatoorahResponse.status, myFatoorahBody.Message);
            return res.status(400).json({ message: 'Failed to create payment' });
        }

        const invoiceId = myFatoorahBody.Data.InvoiceId;
        const pmtLink = myFatoorahBody.Data.PaymentURL;

        console.log(TAG, "Invoice ID:", invoiceId);
        console.log(TAG, "Payment link:", pmtLink);

        const pmtRes = await getPaymentStatus({ key: invoiceId, keyType: 'InvoiceId' });
        const pmtBody = await pmtRes.json();

        console.log(TAG, "Payment status response:", pmtBody);

        await db.push(`/myfatoorah/payments/${invoiceId}`, {
            createdAt: new Date(),
            type: "exec",
            request: {
                CustomerReference: myFatoorahBody.Data.CustomerReference,
                InvoiceId: myFatoorahBody.Data.InvoiceId,
                PaymentURL: myFatoorahBody.Data.PaymentURL
            },
            response: pmtBody.Data
        });

        console.log(TAG, "Stored payment data in DB");

        return res.status(200).json({
            message: 'Payment link created',
            data: {
                pmtLink
            }
        });

    } catch (error) {
        console.log(TAG, "error", error.message);
        return res.status(500).json({ error: error.message });
    }
};