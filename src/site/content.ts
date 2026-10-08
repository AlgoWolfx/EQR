export const faqs = [
  {
    question: 'Is this QR code generator really free?',
    answer:
      'Yes. Create and download static QR codes for free. There is no trial, subscription, credit card or checkout.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No. Enter your information, customize your code if you want, and download it. No sign-up required.',
  },
  {
    question: 'Do free QR codes expire?',
    answer:
      'The static QR code itself has no expiration date. If it points to a website or file that later moves or becomes unavailable, it will still point to that old address. Keep the destination online.',
  },
  {
    question: 'Does EGORA add a watermark?',
    answer:
      'No. Downloaded images contain your QR code and any logo you choose to add. We never add EGORA branding to your code.',
  },
  {
    question: 'How many QR codes can I create?',
    answer:
      'There is no generation quota. Create as many as you need. Bulk ZIP exports support up to 50 codes per batch to keep processing manageable on your device.',
  },
  {
    question: 'Can I use my QR code commercially?',
    answer:
      'Yes. Use your codes on business cards, packaging, posters or menus. You are responsible for any content and logos you add.',
  },
  {
    question: 'Can I make a Wi-Fi QR code?',
    answer:
      'Yes. Select Wi-Fi and enter the network name, security type and password. Generation stays in your browser. Anyone who can scan the code can read its Wi-Fi details, so share it with intended guests.',
  },
  {
    question: 'Can I create a WhatsApp QR code?',
    answer:
      'Yes. Select WhatsApp, enter the phone number including its country code, and optionally add a message. Scanning opens a chat; it does not send the message automatically.',
  },
  {
    question: 'Can I download my QR code as SVG?',
    answer:
      'Yes. SVG stays sharp when resized and is useful for print. PNG works well for images and everyday sharing. Always test the code at its final size before publishing.',
  },
  {
    question: 'What is the difference between static and dynamic QR codes?',
    answer:
      'Static QR codes contain the information directly, so their encoded content cannot be changed after download. Dynamic codes use a managed redirect that can change destinations and may collect analytics. This tool creates static codes without a managed redirect or tracking service.',
  },
];

export const useCases = [
  {
    name: 'Websites & social profiles',
    kind: 'url',
    text: 'Link to your website or social profile using its full public URL.',
  },
  {
    name: 'Restaurant & PDF menus',
    kind: 'url',
    text: 'Use the public link to your hosted menu or PDF. This tool creates the code; it does not host the file.',
  },
  {
    name: 'Guest Wi-Fi',
    kind: 'wifi',
    text: 'Let guests connect without typing the network name and password.',
  },
  {
    name: 'WhatsApp chats',
    kind: 'whatsapp',
    text: 'Open a conversation with an optional pre-filled message.',
  },
  {
    name: 'Business cards & contacts',
    kind: 'contact',
    text: 'Share a contact card that people can save to their phone.',
  },
  {
    name: 'Events & product packaging',
    kind: 'url',
    text: 'Point to tickets, directions, instructions or product information. Keep the linked page available.',
  },
];
