
import { ImapFlow } from "imapflow";
import type { Email } from "../models/email.js";

export class GmailService {
  private readonly email: string;
  private readonly appPassword: string;

  constructor() {
    const email = process.env.GMAIL_EMAIL;
    const password = process.env.GMAIL_APP_PASSWORD;

    if (!email || !password) {
      throw new Error("Gmail credentials are missing");
    }

    this.email = email.trim();
    this.appPassword = password.replace(/\s/g, "");
  }

  async getLatestEmails(count: number): Promise<Email[]> {
    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: this.email,
        pass: this.appPassword
      },
      logger: false
    });

    await client.connect();

    try {
      const lock = await client.getMailboxLock("INBOX");

      try {
        const total = client.mailbox
          ? client.mailbox.exists
          : 0;

        const emails: Email[] = [];

        if (total === 0 || count <= 0) {
          return emails;
        }

        const start = Math.max(1, total - count + 1);

        for await (const message of client.fetch(
          `${start}:${total}`,
          {
            envelope: true,
            internalDate: true
          }
        )) {
          const envelope = message.envelope;

          emails.push({
            subject: envelope?.subject ?? "",
            from: envelope?.from
              ?.map(sender =>
                `${sender.name ?? ""} <${sender.address ?? ""}>`
              )
              .join(", ") ?? "",
            date: message.internalDate
              ? new Date(message.internalDate)
              : null
          });
        }

        return emails
          .sort((a, b) =>
            (b.date?.getTime() ?? 0) -
            (a.date?.getTime() ?? 0)
          )
          .slice(0, count);
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }
}
