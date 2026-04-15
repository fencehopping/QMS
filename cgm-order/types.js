/**
 * CGM order payload and normalized model reference types for the test page.
 * These typedefs keep the transformation layer explicit without binding the UI
 * directly to the raw API response shape.
 */

/**
 * @typedef {object} RawCgmOrderResponse
 * @property {boolean} success
 * @property {string} message
 * @property {{ orderDetails?: RawCgmOrderDetails }} [data]
 * @property {number} [statusCode]
 */

/**
 * @typedef {object} RawCgmOrderDetails
 * @property {string} [product]
 * @property {string} [salesPerson]
 * @property {string} [cgmEducator]
 * @property {string} [patientAdvocate]
 * @property {string} [physician]
 * @property {string | null} [dateConfirmed]
 * @property {string | null} [appointmentDate]
 * @property {string} [doFollowUp]
 * @property {string} [patientFollowUp]
 * @property {string} [priorAuth]
 * @property {RawCgmDoDetails} [doDetails]
 * @property {RawCgmRequestDetails} [requestDetails]
 * @property {RawCgmTransaction[]} [txnHistory]
 */

/**
 * @typedef {object} RawCgmDoDetails
 * @property {string} [diagnosis1]
 * @property {string} [diagnosis2]
 * @property {string} [cgmBilling]
 * @property {string} [cgmModel]
 * @property {string} [shipToAddress]
 * @property {string} [validAddress]
 * @property {string} [overrideUSPS]
 * @property {string} [status]
 * @property {string} [snfHospice]
 * @property {string} [shipmentDuration]
 * @property {string} [paymentType]
 * @property {string} [openInvoices]
 * @property {string} [totalAmount]
 * @property {string} [paymentNotes]
 * @property {string} [isReorderCancelled]
 * @property {string} [thinFilmStrips]
 * @property {string | null} [effectiveDate]
 * @property {string | null} [expirationDate]
 * @property {string} [autoClaimCreation]
 */

/**
 * @typedef {object} RawCgmRequestDetails
 * @property {number | string} [request]
 * @property {boolean} [isAnchorOrder]
 * @property {string} [authorization]
 * @property {string} [units]
 * @property {string} [authDates]
 * @property {string | null} [shipDate]
 * @property {string | null} [shippedTo]
 * @property {string} [cgmModel]
 * @property {string} [cgmType]
 * @property {string} [shipmentDuration]
 * @property {RawCgmItemDetail[]} [itemDetails]
 */

/**
 * @typedef {object} RawCgmItemDetail
 * @property {string} [item]
 * @property {number} [quantity]
 * @property {string} [serialNumber]
 * @property {string | null} [lastShipmentDate]
 * @property {string | null} [futureShipDate]
 */

/**
 * @typedef {object} RawCgmTransaction
 * @property {string} [date]
 * @property {string} [time]
 * @property {string} [status]
 * @property {string} [createdBy]
 * @property {string} [misc]
 */

export const CGM_ORDER_TYPE_KEYS = [
  "RawCgmOrderResponse",
  "RawCgmOrderDetails",
  "RawCgmDoDetails",
  "RawCgmRequestDetails",
  "RawCgmItemDetail",
  "RawCgmTransaction",
];
