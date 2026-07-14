/* Auto-migrated from Blazor C# Request/Response/dto classes. */

export type ApiPrimitive = string | number | boolean | null;

export interface LegacyApiResponse {
  [key: string]: unknown;
}

export interface RCancelEvent {
  idEvent?: string;
  Comment?: string;
}

export interface RCashierEvent {
  IdOrganizer: number;
  Name?: string;
  Date?: string;
  IdState?: number;
  Page: number;
}

export interface RCreateEvent {
  IdOrganizer: number;
  Name?: string;
  IdEventCategory: number;
  Description?: string;
  keyWords?: string;
  NamePlace?: string;
  Street?: string;
  NumExt?: string;
  IdState: number;
  StateDescription?: string;
  IdNeighborhood: number;
  LinkMap?: string;
  Latitude?: string;
  Longitude?: string;
  EventDate?: string;
  EventDateEnd?: string;
  Address?: string;
  EventImage: string | number[];
  IdStatus: number;
  EventOwner?: string;
}

export interface RCreateRole {
  Email: string;
  Name: string;
  IdRole: number;
  IdUser: number;
  IdOrganizer: number;
}

export interface RCreateTicket {
  NameTicket?: string;
  IdStatusTicket: number;
  DescriptionTicket?: string;
  IdEvent: string;
  Quantity: string;
  Price: string;
  IsExtra?: boolean;
  ColorTicket?: string;
  SaleStartDate?: string;
  SaleEndDate?: string;
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
// (GetAdminEvents), espejo de DtoAdminEvents/ResponseGeneric del C#.
export interface REvents {
  idOrganizer: number;
  idStatus?: string;
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

export interface RGetDashboardEvents {
  IdOrganizer: number;
  Page: number;
}

export interface RGetInvoice {
  folio: number;
}

export interface RGetTicketByFolio {
  Folio: string;
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

export interface CashierEventR {
  Code: boolean;
  Message?: string;
  cashierEvents?: EventsOrganizerListCashier[];
}

export interface EventsOrganizerListCashier {
  IdEvent: number;
  Name?: string;
  DateAndTime?: string;
  Address?: string;
  SoldTickets: number;
  AvailableTickets: number;
  EventStatus: string;
  IdEventStatus: number;
}

export interface StatusCashier {
  IdStatus: string;
  StatusName?: string;
}

export interface StatesCashier {
  IdState: number;
  StateName?: string;
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

export interface GetNeighborhoodsByZipCodeR {
  TotalRecords: number;
  dataZipCode: DataZipCode;
}

export interface DataZipCode {
  IdState: number;
  state: string;
  IdMunicipality: number;
  Municipality: string;
  NeighborhoodList: NeighborhoodDetails[];
}

export interface NeighborhoodDetails {
  IdNeighborhood: number;
  Description: string;
}

export interface GetTicketByFolioR {
  Code: boolean;
  Message: string;
  ticketFolio: ticketFolio[];
}

export interface ticketFolio {
  Folio: number;
  IdTicketClass: number;
  FolioQuantity: number;
  IdEvent: number;
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

export interface TicketR {
  Code: boolean;
  Message: string;
  TotalDeRegistros: number;
  ticketOrganizerList?: TicketOrganizerList[];
}

export interface TicketOrganizerList {
  idTicketClass?: string;
  name?: string;
  price?: string;
  quantity?: string;
  description?: string;
  isExtra?: number;
  ticketColor?: string;
  statusMsg?: string;
  idStatus?: string;
  saleStartDate?: string;
  saleEndDate?: string;
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