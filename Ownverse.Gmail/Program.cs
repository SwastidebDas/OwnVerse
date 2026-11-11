
using MailKit;
using MailKit.Net.Imap;
using MailKit.Security;
using Microsoft.Extensions.Configuration;

var configuration = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .Build();

string email = configuration["Gmail:Email"]
    ?? throw new Exception("Gmail email not configured.");

string appPassword = configuration["Gmail:AppPassword"]
    ?? throw new Exception("Gmail App Password not configured.");

using var client = new ImapClient();

// Step 1: Connect to Gmail
await client.ConnectAsync(
    "imap.gmail.com",
    993,
    SecureSocketOptions.SslOnConnect
);

Console.WriteLine("Connected to Gmail!");

Console.WriteLine($"Email: [{email}]");
Console.WriteLine($"Password length: {appPassword.Length}");
// Step 2: Authenticate
client.AuthenticationMechanisms.Remove("XOAUTH2");

await client.AuthenticateAsync(
    email.Trim(),
    appPassword.Trim()
);

Console.WriteLine("Authentication successful!");

// Step 3: Open Inbox
var inbox = client.Inbox;

await inbox.OpenAsync(FolderAccess.ReadOnly);

Console.WriteLine($"Total emails: {inbox.Count}");

// Step 4: Retrieve latest 5 emails
int start = Math.Max(0, inbox.Count - 5);

for (int i = inbox.Count - 1; i >= start; i--)
{
    var message = await inbox.GetMessageAsync(i);

    Console.WriteLine("-------------------------");
    Console.WriteLine($"From: {message.From}");
    Console.WriteLine($"Subject: {message.Subject}");
    Console.WriteLine($"Date: {message.Date}");
}

// Step 5: Disconnect
await client.DisconnectAsync(true);
