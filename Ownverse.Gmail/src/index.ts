
import "dotenv/config";
import { GmailService } from "./services/gmail.service.js";

async function main() {
  const gmailService = new GmailService();

  const emails = await gmailService.getLatestEmails(5);

  for (const email of emails) {
    console.log("-------------------------");
    console.log(`From: ${email.from}`);
    console.log(`Subject: ${email.subject}`);
    console.log(`Date: ${email.date}`);
  }
}

main().catch(error => {
  console.error("Ownverse error:", error);
  process.exitCode = 1;
});
