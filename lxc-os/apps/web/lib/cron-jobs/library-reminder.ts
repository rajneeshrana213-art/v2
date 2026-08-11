
import { prisma } from "../prisma";
import Logger from "../utils/logger";

export async function sendOverdueReminders() {
  const overdueIssues = await prisma.issueTransaction.findMany({
    where: {
      returnDate: null,
      dueDate: { lt: new Date() },
    },
    include: { member: { include: { user: true } }, bookCopy: { include: { book: true } } },
  });

  overdueIssues.forEach((issue) => {
    Logger.info(`Reminder: User ${issue.member.user.email} has overdue book ${issue.bookCopy.book.title}`);
    // Implement email/notification logic here
    // e.g. await sendEmail(...)
  });

  return { count: overdueIssues.length };
}
