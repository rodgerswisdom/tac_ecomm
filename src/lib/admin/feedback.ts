import { toast } from "sonner"

export const ADMIN_TOASTER_ID = "admin"
export const ADMIN_NOTICE_PARAM = "notice"
export const ADMIN_MESSAGE_PARAM = "msg"

export type AdminNoticeType = "success" | "error"

export const adminToast = {
  success(message: string) {
    toast.success(message, { toasterId: ADMIN_TOASTER_ID })
  },
  error(message: string) {
    toast.error(message, { toasterId: ADMIN_TOASTER_ID })
  },
}

export function buildAdminFlashUrl(
  path: string,
  { type, message }: { type: AdminNoticeType; message: string }
) {
  const url = new URL(path, "http://local")
  url.searchParams.set(ADMIN_NOTICE_PARAM, type)
  url.searchParams.set(ADMIN_MESSAGE_PARAM, message)
  return `${url.pathname}${url.search}`
}
