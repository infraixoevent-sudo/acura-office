/* Auto-migrated from Blazor C# Request/Response/dto classes. */

export type ApiPrimitive = string | number | boolean | null;

export interface LegacyApiResponse {
  [key: string]: unknown;
}

export interface RCancelEvent {
  idEvent?: string;
  Comment?: string;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #23): wire final camelCase,
// sustituye el RCashierEvent/CashierEventR/EventsOrganizerListCashier
// PascalCase auto-migrado (sin otro consumidor en el repo).
export interface RGetCashierEvents {
  idOrganizer: number;
  name?: string;
  date?: string;
  idState?: number;
  page: number;
}

export interface CashierEventItem {
  idEvent: number;
  eventName: string;
  eventDateTime: string;
  eventAddress: string;
  idEventStatus: number;
  eventStatus: string;
  soldTickets: number;
  availableTickets: number;
}

export interface GetCashierEventsR {
  code: boolean;
  message: string | null;
  cashierEvents?: CashierEventItem[];
  totalDeRegistros?: number;
  totalDePaginas?: number;
}

export interface RCreateEvent {
  IdOrganizer: number;
  Name?: string;
  IdEventCategory: number;
  Description?: string;
  KeyWords?: string;
  NamePlace?: string;
  Street?: string;
  NumExt?: string;
  NumInt?: string;
  IdState: number;
  StateDescription?: string;
  IdNeighborhood: number;
  LinkMap?: string;
  Latitude?: string;
  Longitude?: string;
  EventDate?: string;
  EventDateEnd?: string;
  Address?: string;
  IdStatus: number;
  EventOwner?: string;
  // Base64 opcionales — la subida real a ACURA-MULTIMEDIA queda estacionada
  // (ver ACURA-EVENTS PR #24, docs/backend-standards.md): el backend acepta
  // estos campos pero los ignora, no se persisten en EventsImages.
  EventImage?: string;
  EventMobileImage?: string;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #24): wire final camelCase,
// espejo de Program.cs (Results.Ok(new { response.code, response.message,
// response.IdEvent }), siempre 200).
export interface CreateEventR {
  code: boolean;
  message: string;
  idEvent: number;
}

export interface RCreateRole {
  Email: string;
  Name: string;
  IdRole: number;
  IdUser: number;
  IdOrganizer: number;
}

// Espejo del contrato real (ACURA-USERS PR #30, CreateTicketByEvent +
// Query.createTicket): un boleto por llamada, IdStatusTicket lo manda siempre
// el Blazor hardcodeado en 1 (puebla TicketClass.IdStatus, no confundir con
// el IdTicketStatus que calcula el servidor por fecha para la tabla Ticket).
export interface RCreateTicket {
  NameTicket: string;
  IdStatusTicket: number;
  DescriptionTicket: string;
  IdEvent: number;
  Quantity: number;
  Price: number;
  IsExtra: boolean;
  ColorTicket: string;
  SaleStartDate: string;
  SaleEndDate: string;
}

export interface CreateTicketR {
  code: boolean;
  message: string;
}

export interface RDeleteTickets {
  idTicketClass?: number;
}

export interface RDeleteUser {
  idUser: number;
  idOrganizer: number;
}

export interface REditEvent {
  idEvent?: string;
  Name?: string;
  Description?: string;
  PhoneNumber: string;
  EventDate?: string;
  Address?: string;
  Latitude?: string;
  Longitude?: string;
  IdStatus: number;
  IdEventCategory: number;
  EventOwner?: string;
  IdNeighborhood: number;
  IdState: number;
  EventImage?: string | number[];
  imageOrder?: string;
  keyWords?: string;
  placeName?: string;
  EventDateEnd?: string;
  LinkMap?: string;
  idVisibility?: number;
  street?: string;
  municipality?: string;
  zipCode?: string;
  numExt?: string;
  IdOrganizer?: number;
  stateDescription?: string;
}

export interface REventPublication {
  IdEvent?: string;
}

// Re-migrado (Protocolo R1-R7): wire final camelCase de ACURA-EVENTS
// (GetAdminEvents), espejo de GetAdminEventsRequest del Next (no de REvents.cs
// del Blazor original, que mandaba idStatus como string — ver ACURA-EVENTS
// PR #16, ya wire final; el office nuevo llama directo a ese contrato).
export interface REvents {
  idOrganizer: number;
  idStatus?: number;
  name?: string;
  date?: string;
  idState?: number;
  page?: number;
}

export interface RFullPayment {
  idCashier: number;
  idMethodPayment: number;
  paymentAuthorizationNumber: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  idEvent: number;
  folio: number;
  ticketsList: TicketsPayments[];
}

export interface TicketsPayments {
  idTicketClass: number;
  quantity: number;
}

export interface RGetCommissionByOrganizer {
  IdOrganizer: number;
}

// Re-migrado (Protocolo R1-R7): wire final camelCase de ACURA-EVENTS
// (GetDashboardEvents), espejo de GetDashboardRequest/DtoDashboardEvent del
// Next (ver ACURA-EVENTS PR #22). message es null en el camino de éxito
// (ResponseGeneric.message nunca se asigna ahí en el C#); eventDateStart/
// eventDateSale llegan en formato "yyyy/MM/dd HH:mm:ss" (con slashes), y
// eventDateSale es el string literal "0" cuando no hay VisibilityStartDate.
export interface RGetDashboardEvents {
  idOrganizer: number;
  page: number;
}

export interface DashboardEventItem {
  idEvent: number;
  eventName: string;
  soldTickets: number;
  availableTickets: number;
  totalTickets: number;
  eventProfits: number;
  eventDateStart: string;
  eventDateSale: string;
  eventPercentage: number;
}

export interface GetDashboardEventsR {
  code: boolean;
  message: string | null;
  dashboardEvents?: DashboardEventItem[];
  totalDePaginas?: number;
  totalDeRegistros?: number;
}

export interface RGetInvoice {
  folio: number;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #23): wire final camelCase.
export interface RGetTicketByFolio {
  folio: number;
  offset?: number;
}

export interface RGetUserbyEmail {
  Email: string;
}

export interface RLogIn {
  Email: string;
  Pass: string;
  IsAdmin: boolean;
}

export interface RNeighborhoodsByZipCode {
  ZipCode: string;
}

export interface RPublishEvent {
  Visibility?: string;
  IdEvent?: string;
  IdOrganizer?: string;
  visibilityStartDate?: string;
}

export interface RRecoverPassword {
  Email: string;
  Subject: string;
}

export interface RTicket {
  idEvent?: string;
}

export interface RTicketing {
  IdEvent?: string;
  Folio: number;
}

export interface RTicketingStock {
  IdEvent?: string;
}

export interface RUpdatePassword {
  Code: string;
  Password: string;
}

export interface RUpdateTicket {
  IdEvent: string;
  TicketName: string;
  IdTicketClass: string;
  Price: string;
  Quantity: number;
  Available: number;
  IsExtra: number;
  SaleStartDate?: string;
  SaleEndDate?: string;
  IdTicketStatus: number;
  TicketColor: string;
}

export interface RUserRoles {
  idOrganizer: number;
  page: number;
}

// Wire final camelCase (ACURA-EVENTS, GetEventCategory) — espejo de
// Program.cs: Results.Ok(new { code=true, cat.eventCategoriesList }), sin
// "message". Sustituye el shape PascalCase anterior (sin consumidor real).
export interface EventCategoryR {
  code: boolean;
  eventCategoriesList: EventCategoryItem[];
}

export interface EventCategoryItem {
  id: number;
  description: string;
  urlImage: string;
}

// Wire final camelCase (ACURA-EVENTS, GetEventStatus) — espejo de
// Program.cs: Results.Ok(new { code=true, cat.eventStatuses }), sin
// "message" ni envoltorio "data".
export interface GetEventStatusR {
  code: boolean;
  eventStatuses: EventStatusItem[];
}

export interface EventStatusItem {
  idEventStatus: number;
  description: string;
}

export interface RGetOrganizersEventsFiltered {
  organizerName?: string;
  eventName?: string;
  idEventStatus?: number;
  idEventCategory?: number;
  startDate?: string;
  endDate?: string;
  page: number;
}

export interface GetOrganizersEventsFilteredR {
  code: boolean;
  message?: string;
  events?: OrganizerEventItem[];
  totalElements: number;
  totalPages: number;
}

export interface OrganizerEventItem {
  idOrganizer: number;
  organizerName: string;
  idEvent: number;
  eventName: string;
  idEventCategory: number;
  category: string | null;
  eventDate: string;
  idEventStatus: number;
  status: string | null;
  totalTransferred: number;
  totalPendingToTransfer: number;
  totalEarnings: number;
  soldTickets: number;
  availableTickets: number;
}

export interface EventsR {
  code: boolean;
  message?: string;
  adminEvents?: EventsOrganizerList[];
  totalDePaginas?: number;
  totalDeRegistros?: number;
}

export interface EventsOrganizerList {
  name?: string;
  address?: string;
  soldTickets: number;
  availableTickets: number;
  dateAndTime?: string;
  idStatus: number;
  idEvent: number;
}

export interface RGetTicketsReport {
  idUser: number;
  idEvent: number;
  startDate: string;
  endDate: string;
  folio?: string;
  email?: string;
  page: number;
  pageSize: number;
}

// Re-migrado (Protocolo R1-R7): wire final camelCase de ACURA-ADMIN
// (GetTicketsReport), sin doble emisión. "pdfurl" (todo minúsculas) es el
// nombre real que produce JsonNamingPolicy.CamelCase de STJ sobre PDFURL.
export interface GetTicketsReportR {
  code: boolean;
  message?: string;
  tickets?: TicketsList[];
  totalElements: number;
  totalPages: number;
}

export interface TicketsList {
  idOrder: number;
  amount: number;
  status: string | null;
  quantity: number;
  pdfurl?: string | null;
}

export interface Status {
  IdStatus: string;
  StatusName?: string;
}

export interface States {
  IdState: number;
  StateName?: string;
}

export interface RGetOrganizersInfoFiltered {
  organizerName?: string;
  email?: string;
  idState?: number;
  idOrganizerStatus?: number;
  page: number;
}

export interface GetOrganizersInfoFilteredR {
  code: boolean;
  message?: string;
  organizers?: OrganizerGeneralInfo[] | null;
  totalElements: number;
  totalPages: number;
}

export interface OrganizerGeneralInfo {
  idOrganizer: number;
  name: string;
  email: string;
  phoneNumber: string;
  state: string | null;
  approvedAt?: string | null;
  idStatus: number;
  eventsCreated: number;
  activeEvents: number;
}

export interface FullPaymentR {
  code: boolean;
  message: string;
  description: string;
  responseTicketsQR: TicketsQR;
}

export interface TicketsQR {
  message: string;
  nameEvent: string;
  address: string;
  dateEvent: string;
  ticketQRList: QRTicket[];
  urlPdf: string;
  idOrder: string;
}

export interface QRTicket {
  urlQR: string;
  description: string;
}

// Wire final camelCase (Protocolo R1-R7) de CreateRole/EditRole/DeleteRole —
// ResponseGeneric del C# solo serializa code/message.
export interface RoleActionRR {
  resp: RoleActionR;
}

export interface RoleActionR {
  code: boolean;
  message: string;
}

export interface GetAdminEventByIdEventR {
  Code: boolean;
  Message: string;
  Event?: Event;
  tickets?: tickets;
}

export interface Event {
  IdOrganizer?: string;
  Name?: string;
  Description?: string;
  UrlImage?: string;
  Latitude?: string;
  Longitude?: string;
  IdEvent: number;
  IdState: number;
  IdEventCategory: number;
  Address?: string;
  DateAndTime?: string;
  KeyWords?: string;
  placeName?: string;
  State?: string;
  DateAndTimeEnd?: string;
  street?: string;
  municipality?: string;
  zipCode?: string;
  numExt?: string;
  neighborhood?: string;
  idVisibility?: number;
  IsEventCancelled: boolean;
}

export interface tickets {
  Quantity?: string;
  PriceMin?: string;
  PriceMax?: string;
}

export interface GetInformation {
  response: GetCancelInformationR;
}

export interface GetCancelInformationR {
  code: boolean;
  message: string;
  idEvent: number;
  earnings: string;
  eventName: string;
  soldTickets: number;
  totalDePaginas: number;
  totalDeRegistros: number;
}

export interface GetCommissionByOrganizerR {
  commissionList: Commission[];
}

export interface Commission {
  descriptionCommission: string;
  descriptionCommisionType: string;
  typeCommision: number;
  value: number;
}

export interface GetDashBoarsEventsR {
  Code: boolean;
  Message?: string;
  TotalDeRegistros: number;
  TotalDePaginas: number;
  dashboardEvents: DashBoardsEvents[];
}

export interface DashBoardsEvents {
  IdEvent: number;
  EventName: string;
  SoldTickets: number;
  AvailableTickets: number;
  TotalTickets: number;
  EventPercentage: number;
  EventDateStart: string;
  EventDateSale: string;
  EventProfits: string;
}

export interface GetInvoicesR {
  resp: Resp;
}

export interface Resp {
  information: Information;
  detail: Detail;
  description: string;
  token: string;
}

export interface Information {
  idOrganizer: number;
  organizerName: string;
  idEvent: number;
  eventName: string;
  eventDate: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  eventPlace: string;
  eventUrlImage: string;
  eventAddress: string;
}

export interface PreorderDetail {
  quantity: number;
  description: string;
  price: number;
}

export interface Detail {
  preorderDetail: PreorderDetail[];
  totaltoPay: number;
  totalQuantity: number;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #24): wire final camelCase.
export interface GetNeighborhoodsByZipCodeR {
  code: boolean;
  message: string;
  totalDeRegistros: number;
  dataZipCode: DataZipCode;
}

export interface DataZipCode {
  idState: number;
  state: string;
  idMunicipality: number;
  municipality: string;
  neighborhoodList: NeighborhoodDetails[];
}

export interface NeighborhoodDetails {
  idNeighborhood: number;
  description: string;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #23): wire final camelCase.
export interface GetTicketByFolioR {
  code: boolean;
  message: string | null;
  ticketFolio?: TicketFolioItem[];
}

export interface TicketFolioItem {
  folio: number;
  idTicketClass: number;
  folioQuantity: number;
  idEvent: number;
  isCancelled: number;
}

// Wire final camelCase (Protocolo R1-R7): UserbyMailR del C# serializa userName/idUser.
export interface GetUserbyEmailRR {
  resp: GetUserbyEmailR;
}

export interface GetUserbyEmailR {
  code: boolean;
  message: string;
  userName?: string;
  idUser?: number;
}

export interface LogInR {
  idUser: number;
  name: string;
  code: boolean;
  message: string;
  tkn: string;
  userMenu?: UserMenu[];
  idOrganizer: number;
  nameRol?: string;
}

// Wire final camelCase real de ACURA-USERS/api/LogIn (espejo de Query.GetMenuByIdUser):
// árbol de vistas del rol vigente, un solo nivel de anidamiento (las vistas con
// main > 0 cuelgan de childMenu de su vista padre).
export interface UserMenu {
  idView: number;
  description: string;
  url: string;
  isMenu: boolean;
  isMain: boolean;
  main: number;
  childMenu?: UserMenu[];
  idRol: number;
  nameRol: string;
}

export interface RecoverPasswowordR {
  Code: boolean;
  Message: string;
  Token: string;
}

// Wire final camelCase (Protocolo R1-R7): catálogo de roles, RolesR del C#
// hereda de ResponseGeneric (code/message ya minúsculas en el código fuente).
export interface RoleCatalogR {
  roles: RoleCatalogEntry[];
  code: boolean;
  message: string;
}

export interface RoleCatalogEntry {
  idRole: number;
  description: string | null;
}

export interface RGetTicketByOrganizer {
  idEvent: number;
  page: number;
}

// Re-migrado (Protocolo R1-R7, ACURA-EVENTS PR #24): wire final camelCase,
// espejo de Program.cs (Results.Ok(new { resp.code, resp.message,
// resp.TotalDeRegistros, resp.TicketOrganizerList })) — rangePrice y
// totalDePaginas existen en el DTO C# pero el endpoint real nunca los
// proyecta en la respuesta.
export interface GetTicketByOrganizerR {
  code: boolean;
  message: string;
  totalDeRegistros: number;
  ticketOrganizerList: TicketOrganizerItem[];
}

export interface TicketOrganizerItem {
  idTicketClass: number;
  name: string;
  descriptionTicket: string;
  price: string;
  quantity: number;
  available: number;
  ticketStatusDescription: string;
  isExtra: number;
  dateResult: string;
  saleStartDate: string | null;
  saleEndDate: string | null;
  idTicketStatus: number;
  idStatus: number;
  ticketColor: string;
  statusMsg: string;
}

export interface Ticketing {
  Code: boolean;
  Message?: string;
  ticketsList?: TicketList[];
}

export interface TicketsSellingR {
  Code: boolean;
  Message?: string;
  ticketList?: TicketList[];
  TicketFolio?: TicketFolio;
}

export interface TicketList {
  IdTicketClass: number;
  Name?: string;
  Price?: string;
  Quantity: number;
  Available: number;
  Description?: string;
  isExtra: number;
  TicketColor?: string;
}

export interface TicketFolio {
  IdTicketClass: number;
  Name?: string;
  Price?: string;
  Quantity: number;
  Available: number;
  Description?: string;
  isExtra: number;
  TicketColor?: string;
}

export interface UpdatePasswordR {
  Code: boolean;
  Message: string;
  Token: string;
}

export interface UserRolesRR {
  resp: UserRolesR;
}

export interface UserRolesR {
  page: number;
  totalDePaginas: number;
  totalDeRegistros: number;
  code: boolean;
  message: string;
  usersRoles: UserRoles[];
}

export interface UserRoles {
  idUser: number;
  idRole: number;
  email: string;
  name: string;
  roleDescription: string;
  roleDate: string;
  isOwner: boolean;
}

export interface SelectedTickets {
  Total: number;
  Tickets: SelectedTicket[];
  Folio: number;
}

export interface SelectedTicket {
  IdTicketClass: number;
  Name: string;
  Quantity: number;
}

// Wire final camelCase (Protocolo R1-R7): AvailableViewInfo del C# solo
// serializa idView/name/main — nunca IsMenu/IsMain/URL.
export interface RoleView {
  idView: number;
  name: string | null;
  main: number | null;
}

export interface GetAvailableRoleViewsR {
  code: boolean;
  message: string;
  views: RoleView[];
}

// Wire final camelCase: GetOrganizerRolesR del C# (roles del organizador + catálogo default)
export interface GetOrganizerRolesR {
  code: boolean;
  message: string;
  roles: OrganizerRoleInfo[];
}

export interface OrganizerRoleInfo {
  idRole: number;
  name: string | null;
  isDefault: boolean;
}

// Wire final camelCase: GetOrganizerRoleDetailsR del C#, plano (views = IdView ya asignados)
export interface GetOrganizerRoleDetailsR {
  code: boolean;
  message: string;
  idRole: number | null;
  name: string | null;
  views: number[] | null;
}

// Wire final camelCase compartido por CreateOrganizerRole/UpdateOrganizerRole/DeleteOrganizerRole
// (ResponseGeneric del C# solo serializa code/message, sin envoltura resp)
export interface OrganizerRoleActionR {
  code: boolean;
  message: string;
}

// Wire final camelCase (Protocolo R1-R7) — cluster PaymentHistory (ADMIN).

export interface RGetOrganizers {
  // sin request body — POST plano
}

export interface OrganizerListItem {
  idOrganizer: number;
  name: string | null;
}

export interface GetOrganizersR {
  code: boolean;
  message: string;
  organizers: OrganizerListItem[];
}

export interface RGetEventsByOrganizer {
  idOrganizer: number;
}

export interface OrganizerEventListItem {
  idEvent: number;
  name: string;
}

export interface GetEventsByOrganizerR {
  code: boolean;
  message: string;
  events: OrganizerEventListItem[];
}

export interface RGetSaldoByEvent {
  idEvent: number;
}

// balanceTransfered conserva el typo real del C# (Transfer**ed**, sin doble r).
export interface GetSaldoByEventR {
  code: boolean;
  message: string;
  balanceTotal: number;
  balanceTransfered: number;
}

export interface RGetTransferByEvent {
  idEvent: number;
  startDate?: string;
  endDate?: string;
  page: number;
}

export interface EventTransferItem {
  idTransfer: number;
  transferDate: string;
  amount: number;
  bankTransactionNumber: string | null;
  ticketsSold: number;
}

export interface GetTransferByEventR {
  code: boolean;
  message: string;
  eventTransfers: EventTransferItem[];
  totalRecords: number;
  totalPages: number;
}

export interface RGetTransferDetails {
  idTransfer: number;
}

export interface TransferTicketItem {
  name: string | null;
  quantity: number;
  amount: number;
}

export interface TransferCommissionItem {
  description: string | null;
  value: number;
}

export interface GetTransferDetailsR {
  code: boolean;
  message: string;
  eventName?: string;
  bankTransactionNumber?: string | null;
  transferDate?: string | null;
  transferReceiptUrl?: string | null;
  tickets?: TransferTicketItem[] | null;
  subtotal?: number;
  commissions?: TransferCommissionItem[] | null;
  total?: number;
}

// El backend recalcula qué órdenes cubre la transferencia — idOrderLst del
// cliente no existe en el request final (ver ACURA-ADMIN transfer.service.ts).
export interface RRegisterTransferToOrganizer {
  idEvent: number;
  amount: number;
  createDate?: string;
  idUserMaster: number;
  idTransaccion?: string;
  fileTransferRecipient?: string;
}

export interface RegisterTransferR {
  code: boolean;
  message: string;
}

// Wire final camelCase (Protocolo R1-R7) — /Admin/Applications (EVENTS).
// GetOrganizer/GetOrganizerByIdOrganizer/UpdateStatusOrganizerApplication
// responden {code, msj} en vez de {code, message} — espejo literal de
// Program.cs:311/319 del C#, distinto al resto de endpoints de EVENTS.

export interface RGetOrganizerApplications {
  page: number;
  searchOrganizerName?: string;
  idStatusOrganizer?: number;
}

export interface OrganizerApplicationItem {
  idOrganizer: number;
  contactname: string;
  contactEmail: string;
  contactPhoneNumber: string;
  createdAt: string;
  statusApp: string;
}

export interface GetOrganizerApplicationsR {
  code: boolean;
  message: string;
  totalDePaginas: number;
  totalDeRegistros: number;
  dtoOrganizerLst: OrganizerApplicationItem[] | null;
  dtoOrganizerInfo: null;
}

export interface RGetOrganizerApplicationDetail {
  idOrganizer: number;
}

export interface OrganizerApplicationDetail {
  idOrganizer: number;
  urlImg: string | null;
  name: string | null;
  organizerDescription: string | null;
  website: string | null;
  companyName: string | null;
  contactname: string | null;
  contactPhoneNumber: string | null;
  contactEmail: string | null;
  rfc: string | null;
  curp: string | null;
  officialRepresentativeID: string | null;
  proofTaxSituation: string | null;
  accountStatement: string | null;
  proofResidency: string | null;
  clabe: string | null;
  bankName: string | null;
  urlFacebook: string | null;
  urlX: string | null;
  urlInstagram: string | null;
}

export interface GetOrganizerApplicationDetailR {
  code: boolean;
  msj: string;
  organizerInfo?: OrganizerApplicationDetail;
}

export interface RUpdateStatusOrganizerApplication {
  idOrganizer: number;
  idStatusApplication: number;
  message?: string;
  approvedAt?: string;
}

export interface UpdateStatusOrganizerApplicationR {
  code: boolean;
  msj: string;
}