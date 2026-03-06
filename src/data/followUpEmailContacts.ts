export type BadgeVariant = "red" | "amber" | "green";

export interface FollowUpEmailContact {
  initials: string;
  name: string;
  roleCompany: string;
  badge: string;
  badgeVariant: BadgeVariant;
  email: string;
  subject: string;
  body: string;
  infoText: string;
}

export const FOLLOW_UP_EMAIL_CONTACTS: Record<string, FollowUpEmailContact> = {
  "Sarah Kim": {
    initials: "SK",
    name: "Sarah Kim",
    roleCompany: "Senior Associate · McKinsey & Company",
    badge: "7 days overdue",
    badgeVariant: "red",
    email: "skim@mckinsey.com",
    subject: "Following Up — McKinsey BA Internship Application",
    body: `Hi Sarah,

I hope you're doing well! I wanted to follow up on our conversation from February 22nd regarding the Business Analyst Internship at McKinsey.

I remain very excited about the opportunity and would love to hear if there are any updates on next steps. Please don't hesitate to let me know if there's anything additional I can provide.

Thank you so much for your time and continued support throughout this process.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with Sarah on Feb 22 and your McKinsey application status. Feel free to edit before sending.",
  },
  "Tom Walsh": {
    initials: "TW",
    name: "Tom Walsh",
    roleCompany: "Recruiting Coordinator · McKinsey & Company",
    badge: "Due Mar 3",
    badgeVariant: "amber",
    email: "twalsh@mckinsey.com",
    subject: "Following Up — McKinsey Application Status",
    body: `Hi Tom,

I hope you're doing well! I wanted to follow up on our conversation and confirm that my application has been received.

I understand decisions are expected mid-March and would appreciate any updates you're able to share. Please don't hesitate to reach out if there's anything else I can provide.

Thank you for your help throughout this process.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with Tom on Feb 15 and your McKinsey application status. Feel free to edit before sending.",
  },
  "James Liu": {
    initials: "JL",
    name: "James Liu",
    roleCompany: "Product Manager · Stripe",
    badge: "Follow-up sent",
    badgeVariant: "green",
    email: "jliu@stripe.com",
    subject: "Following Up — Stripe PM Role & Referral",
    body: `Hi James,

I hope you're having a great week! I wanted to follow up on our conversation from the tech mixer where you kindly mentioned the possibility of a referral for the PM role at Stripe.

I've since submitted my application and would be grateful if you were still open to putting in a good word. I truly appreciated your openness and advice during our chat.

Please let me know if there's anything I can send over to make it easier.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with James on Feb 28 and your Stripe application status. Feel free to edit before sending.",
  },
  "Priya Nair": {
    initials: "PN",
    name: "Priya Nair",
    roleCompany: "Senior Associate · Bain & Company",
    badge: "Due Mar 3",
    badgeVariant: "amber",
    email: "pnair@bain.com",
    subject: "Following Up — Bain & Company Application",
    body: `Hi Priya,

I hope all is well! I wanted to reach out and follow up after our great conversation at the Sloan networking event last month.

I've submitted my application to Bain and remain very excited about the opportunity. Your insights about what Bain looks for in strong generalists were incredibly helpful in shaping my application.

I'd love to reconnect if you have any availability in the coming weeks.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with Priya on Feb 20 and your Bain application status. Feel free to edit before sending.",
  },
  "Michael Torres": {
    initials: "MT",
    name: "Michael Torres",
    roleCompany: "Partner · Sequoia Capital",
    badge: "14 days overdue",
    badgeVariant: "red",
    email: "mtorres@sequoiacap.com",
    subject: "Following Up — Sequoia Capital Conversation",
    body: `Hi Michael,

I hope you're doing well! I wanted to follow up on our LinkedIn connection and the conversation we started about opportunities at Sequoia Capital.

As I mentioned, I have a strong background in operational experience and am very drawn to Sequoia's portfolio and investment philosophy. I would love to continue our conversation if you have availability for a brief call.

Thank you again for your quick response to my initial outreach.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with Michael on Feb 15 and your Sequoia Capital networking status. Feel free to edit before sending.",
  },
  "Anna Chen": {
    initials: "AC",
    name: "Anna Chen",
    roleCompany: "Recruiter · Google",
    badge: "Follow-up sent",
    badgeVariant: "green",
    email: "achen@google.com",
    subject: "Following Up — Google PM Role via Alumni Network",
    body: `Hi Anna,

I hope you're having a wonderful week! I wanted to follow up on our conversation through the Sloan alumni network regarding the PM role at Google.

Your overview of the interview format and role requirements was extremely helpful. I've been preparing accordingly and would love to stay on your radar as the process moves forward.

Please don't hesitate to reach out if there are any updates or next steps.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with Anna on Mar 1 and your Google networking status. Feel free to edit before sending.",
  },
  "David Park": {
    initials: "DP",
    name: "David Park",
    roleCompany: "Senior Associate · BCG",
    badge: "Follow-up sent",
    badgeVariant: "green",
    email: "dpark@bcg.com",
    subject: "Following Up — BCG Application & Referral",
    body: `Hi David,

I hope all is well! I wanted to follow up and thank you again for your generosity in offering to support my BCG application as a fellow Sloan alum.

I've submitted my application and wanted to make sure you have everything you need from my end. I've attached my resume below for your reference and would be happy to provide anything else that would be helpful.

Truly grateful for your support throughout this process.

Best regards,
[Your Name]
MIT Sloan MBA '26`,
    infoText: "💡 This message was drafted based on your last interaction with David on Jan 30 and your BCG application status. Feel free to edit before sending.",
  },
};

export const getSarahKimContact = (): FollowUpEmailContact =>
  FOLLOW_UP_EMAIL_CONTACTS["Sarah Kim"];
