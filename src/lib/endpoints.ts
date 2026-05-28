export type LegacyService = "user" | "events";

export const legacyEndpoints = {
  "GetCancelInformation": "events",
  "CancelEvent": "events",
  "CreateEvent": "events",
  "GetTicketByOrganizer": "events",
  "CreateTickets": "user",
  "GetDashboardEvents": "events",
  "GetAdminEventByIdEvent": "events",
  "UpdateEvent": "events",
  "PublishEvent": "events",
  "GetAdminEvents": "events",
  "LogIn": "user",
  "RecoveryPassword": "user",
  "GetValidateInventoryTicket": "events",
  "UpdatePasswordRecovery": "user",
  "EditRole": "user",
  "GetRoles": "user",
  "GetRolesByAdmin": "user",
  "GetUserbyEmail": "user",
  "CreateRole": "user",
  "DeleteRole": "user",
  "GetCashierEvents": "events",
  "GetTicketByFolio": "events",
  "FullPayment": "user",
  "UpdateTicket": "events",
  "DeleteTicket": "events",
  "GetCommissionByOrganizer": "events",
  "GetEventCategory": "events",
  "GetInvoice": "user",
  "GetNeighborhoodsByZipCode": "events",
  "GetRolesByOrganizer": "user",
  "GetAvailableRoleViews": "user",
  "CreateUser": "user",
  "DeleteUserAccount": "user",
  "GetUsers": "user",
  "UpdateUserStatus": "user",
  "ValidateCodeRecovery": "user",
  "sendRecoverPasswordEmail": "user",
  "RegenerateOrden": "user"
} as const;

export type LegacyEndpoint = keyof typeof legacyEndpoints;

export function getLegacyService(endpoint: LegacyEndpoint): LegacyService {
  return legacyEndpoints[endpoint];
}
