import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import OtpVerificationProvider from "./service"

export default ModuleProvider(Modules.AUTH, {
  services: [OtpVerificationProvider],
})
