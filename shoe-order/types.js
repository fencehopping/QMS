/**
 * @typedef {Object} RawShoeOrderTransaction
 * @property {string} date
 * @property {string} time
 * @property {string} status
 * @property {string} createdBy
 * @property {string} misc
 */

/**
 * @typedef {Object} RawShoeOrderResponse
 * @property {boolean} success
 * @property {string} message
 * @property {{
 *   orderDetails?: {
 *     salesPerson?: string,
 *     physician?: string,
 *     fitterInArea?: string,
 *     alternateFitter?: string,
 *     fittingAppointmentDate?: string | null,
 *     dispensingAppointment?: string | null,
 *     priorAuth?: string,
 *     doFollowUp?: string,
 *     patientFollowUp?: string,
 *     doDetails?: {
 *       product?: string,
 *       dateDispensed?: string | null,
 *       insertType?: string,
 *       toeFiller?: string,
 *       diagnosis1?: string,
 *       rxSignatureDate?: string | null,
 *       rxExpirationDate?: string | null,
 *       cmnSignatureDate?: string | null,
 *       cmnExpirationDate?: string | null,
 *       accommodations?: string,
 *     },
 *     shoeDetails?: {
 *       request?: number | string,
 *       barCode?: string,
 *       manufacturer?: string,
 *       dealer?: string,
 *       gender?: string,
 *       style?: string,
 *       colour?: string,
 *       size?: string,
 *       width?: string,
 *       closureType?: string,
 *       arrivalDate?: string | null,
 *       insoles?: string,
 *       description?: string,
 *       secondChoice?: string,
 *     },
 *     txnHistory?: RawShoeOrderTransaction[],
 *   }
 * }} data
 * @property {number} statusCode
 */

/**
 * @typedef {Object} NormalizedTimelineEvent
 * @property {string} rawStatus
 * @property {string} createdBy
 * @property {Date | null} occurredAt
 * @property {string} note
 */

/**
 * @typedef {Object} NormalizedShoeOrder
 * @property {boolean} success
 * @property {string} message
 * @property {string} requestId
 * @property {string} salesPerson
 * @property {string} physician
 * @property {string} fitterInArea
 * @property {string} alternateFitter
 * @property {Date | null} fittingAppointment
 * @property {Date | null} dispensingAppointment
 * @property {string} priorAuthorization
 * @property {string} orderFollowUp
 * @property {string} patientFollowUp
 * @property {{
 *   product: string,
 *   dateDispensed: Date | null,
 *   insertType: string,
 *   toeFiller: string,
 *   diagnosis: string,
 *   rxSignatureDate: Date | null,
 *   rxExpirationDate: Date | null,
 *   cmnSignatureDate: Date | null,
 *   cmnExpirationDate: Date | null,
 *   accommodations: string,
 * }} paperwork
 * @property {{
 *   barcode: string,
 *   manufacturer: string,
 *   dealer: string,
 *   gender: string,
 *   style: string,
 *   color: string,
 *   size: string,
 *   width: string,
 *   closureType: string,
 *   arrivalDate: Date | null,
 *   insoles: string,
 *   description: string,
 *   insertType: string,
 *   backupOption: {
 *     manufacturer: string,
 *     style: string,
 *     color: string,
 *     closureType: string,
 *     size: string,
 *     width: string,
 *   } | null,
 * }} product
 * @property {NormalizedTimelineEvent[]} timeline
 */

/**
 * @typedef {Object} PatientStatusChip
 * @property {string} label
 * @property {"neutral" | "info" | "success" | "warning"} tone
 */

/**
 * @typedef {Object} PatientTimelineItem
 * @property {string} label
 * @property {string} date
 * @property {string} explanation
 * @property {"neutral" | "info" | "success" | "warning"} tone
 * @property {boolean} isLatest
 */

/**
 * @typedef {Object} PatientOrderUiModel
 * @property {string} pageTitle
 * @property {{
 *   sectionLabel: string,
 *   headline: string,
 *   summary: string,
 *   chips: PatientStatusChip[],
 *   steps: Array<{ label: string, status: "complete" | "current" | "upcoming" }>,
 * }} hero
 * @property {{
 *   sectionLabel: string,
 *   statusLabel: string,
 *   lastUpdated: string,
 *   explanation: string,
 *   nextStepSummary: string,
 *   actionRequiredLabel: string,
 *   actionRequiredTone: "success" | "warning",
 * }} currentStatusCard
 * @property {{
 *   sectionLabel: string,
 *   nextStepLabel: string,
 *   owner: string,
 *   explanation: string,
 *   cta: { label: string, href: string } | null,
 * }} nextStepCard
 * @property {{
 *   sectionLabel: string,
 *   fittingAppointment: { label: string, value: string },
 *   deliveryAppointment: { label: string, value: string, emptyState: string },
 * }} appointmentsCard
 * @property {{
 *   sectionLabel: string,
 *   image: { src: string, alt: string },
 *   fields: Array<{ label: string, value: string }>,
 *   backupOption: Array<{ label: string, value: string }>,
 * }} productCard
 * @property {{
 *   sectionLabel: string,
 *   fields: Array<{ label: string, value: string }>,
 *   supportingCopy: string,
 * }} paperworkCard
 * @property {{
 *   sectionLabel: string,
 *   fields: Array<{ label: string, value: string }>,
 * }} careTeamCard
 * @property {{
 *   sectionLabel: string,
 *   items: PatientTimelineItem[],
 * }} timelineCard
 * @property {{
 *   requestId: string,
 *   currentMilestone: string,
 *   lastUpdated: string,
 *   patientActionRequired: boolean,
 * }} meta
 */

export {};
