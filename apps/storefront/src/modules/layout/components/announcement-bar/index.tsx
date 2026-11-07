const MESSAGES = [
  "Express delivery in Lagos within 24 to 48 hours",
  "Fresh groceries and laboratory supplies, delivered across Nigeria",
  "Pay securely with card, bank transfer or USSD via Paystack",
]

export default function AnnouncementBar() {
  return (
    <div className="bg-brand-700 text-white">
      <div className="content-container flex h-9 items-center justify-center gap-x-8 text-[12px] font-medium">
        {MESSAGES.map((message, index) => (
          <span
            key={message}
            className={
              index === 0
                ? "block"
                : index === 1
                  ? "hidden small:block"
                  : "hidden medium:block"
            }
          >
            <span className="mr-2 text-sun-300">&#9679;</span>
            {message}
          </span>
        ))}
      </div>
    </div>
  )
}
