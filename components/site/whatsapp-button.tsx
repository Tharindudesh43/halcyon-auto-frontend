import { MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/format";

export async function WhatsAppButton() {
  const { contact } = await getSettings();
  const number = digitsOnly(contact.whatsapp ?? contact.phone ?? "");
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hi Halcyon Auto! I have a question.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-0 rounded-full bg-green-700 p-4 text-white shadow-xl shadow-green-900/30 transition-all duration-300 hover:gap-2 hover:bg-green-800 hover:pr-5 focus-visible:gap-2 sm:bottom-6 sm:right-6"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <MessageCircle className="h-6 w-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
