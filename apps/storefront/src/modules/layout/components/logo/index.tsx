import { clx } from "@modules/common/components/ui"
import Image from "next/image"

type LogoProps = {
  className?: string
  /** "light" is the white version, for dark (blue) backgrounds. */
  tone?: "dark" | "light"
  priority?: boolean
}

/** R'Indisco Supermarket logo. Files live in /public (logo.svg, logo-light.svg). */
export default function Logo({ className, tone = "dark", priority }: LogoProps) {
  return (
    <Image
      src={tone === "light" ? "/logo-light.svg" : "/logo.svg"}
      alt="R'Indisco Supermarket"
      width={444}
      height={112}
      priority={priority}
      className={clx("h-11 w-auto", className)}
      draggable={false}
    />
  )
}
