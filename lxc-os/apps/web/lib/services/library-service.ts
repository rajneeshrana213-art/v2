import { prisma } from "@/lib/prisma";
import {
  BookType,
  BookStatus,
  BookCopyStatus,
  IssueStatus,
  MemberType,
} from "@prisma/client";

interface CreateBookInput {
  title: string;
  isbn?: string;
  author: string;
  publisher?: string;
  language?: string;
  publicationYear?: number;
  description?: string;
  type?: BookType;
  categoryId?: string;
  coverImage?: string;
  libraryId: string;
  quantity?: number;
  price?: number;
  classId?: string;
}

interface IssueBookInput {
  memberId: string;
  bookCopyId: string;
  dueDate?: Date;
}

export const LibraryService = {
  // --- Initialization ---
  async getLibraryBySchoolId(schoolId: string) {
    let library = await prisma.library.findFirst({
      where: { schoolId },
    });

    if (!library) {
      library = await prisma.library.create({
        data: {
          schoolId,
          // Create a default policy too
          policy: {
            create: {
              maxBooksStudent: 5,
              maxBooksTeacher: 10,
              issueDaysStudent: 14,
              issueDaysTeacher: 30,
              finePerDay: 5,
              fineGracePeriod: 2,
              lostBookPenalty: 500,
            },
          },
        },
      });
    }

    return library;
  },

  // --- Policy ---
  async getStats(libraryId: string) {
    const totalBooks = await prisma.book.count({ where: { libraryId } });
    // LibraryMember doesn't have libraryId, so count all active members
    const activeMembers = await prisma.libraryMember.count({
      where: { status: "ACTIVE" },
    });
    // Count currently issued books from this library
    const currentlyIssued = await prisma.issueTransaction.count({
      where: {
        status: "ISSUED",
        bookCopy: {
          book: {
            libraryId: libraryId,
          },
        },
      },
    });
    const overdueBooks = await prisma.issueTransaction.count({
      where: {
        status: "ISSUED",
        dueDate: { lt: new Date() },
        bookCopy: {
          book: {
            libraryId: libraryId,
          },
        },
      },
    });
    return { totalBooks, activeMembers, currentlyIssued, overdueBooks };
  },

  async getRecentTransactions(libraryId: string, limit = 5) {
    return prisma.issueTransaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        member: { include: { user: true } },
        bookCopy: { include: { book: true } },
      },
    });
  },

  async getPolicy(libraryId: string) {
    return prisma.libraryPolicy.findUnique({ where: { libraryId } });
  },

  async updatePolicy(libraryId: string, data: any) {
    return prisma.libraryPolicy.upsert({
      where: { libraryId },
      create: { libraryId, ...data },
      update: data,
    });
  },

  // --- Classes ---
  async getLibraryClasses(libraryId: string) {
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });
    if (!library) throw new Error("Library not found");
    return prisma.class.findMany({
      where: { schoolId: library.schoolId },
      orderBy: { name: "asc" },
    });
  },

  // --- Categories ---
  async getCategories() {
    return prisma.category.findMany();
  },

  async createCategory(name: string, description?: string) {
    return prisma.category.create({ data: { name, description } });
  },

  async updateCategory(id: string, name: string, description?: string) {
    return prisma.category.update({
      where: { id },
      data: { name, description },
    });
  },

  async deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  // --- Books ---
  async createBook(data: CreateBookInput) {
    return prisma.book.create({
      data: {
        title: data.title,
        isbn: data.isbn,
        author: data.author,
        publisher: data.publisher,
        language: data.language,
        publicationYear: data.publicationYear,
        description: data.description,
        type: data.type || "BOOK",
        categoryId: data.categoryId,
        classId: data.classId,
        price: data.price || 0.0,
        coverImage: data.coverImage,
        libraryId: data.libraryId,
        status: "ACTIVE",
        copies: {
          create: Array.from({ length: data.quantity || 1 }).map((_, i) => ({
            barcode: `BC-${Date.now()}-${data.isbn || "NB"}-${i + 1}`,
            status: "AVAILABLE",
          })),
        },
      },
    });
  },

  async getBooks(libraryId: string, query?: any) {
    // Basic formatting for query could be added later
    return prisma.book.findMany({
      where: { libraryId, status: "ACTIVE" },
      include: { category: true, copies: true, class: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getBookById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        class: true,
        copies: {
          include: {
            transactions: {
              where: { status: "ISSUED" },
              include: { member: { include: { user: true } } },
            },
          },
        },
      },
    });
  },

  async updateBook(id: string, data: Partial<CreateBookInput>) {
    return prisma.book.update({
      where: { id },
      data,
    });
  },

  async deleteBook(id: string) {
    // Soft delete or hard? Using hard delete for now but could switch to ARCHIVED
    return prisma.book.delete({ where: { id } });
  },

  // --- Copies ---
  async addCopy(bookId: string, barcode: string, rackLocation?: string) {
    return prisma.bookCopy.create({
      data: {
        bookId,
        barcode,
        rackLocation,
        status: "AVAILABLE",
      },
    });
  },

  async deleteCopy(id: string) {
    return prisma.bookCopy.delete({ where: { id } });
  },

  // --- Members ---
  async getMemberByUserId(userId: string) {
    return prisma.libraryMember.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            student: true,
            teacher: true,
          },
        },
        transactions: {
          where: { status: "ISSUED" },
          include: { bookCopy: { include: { book: true } } },
        },
        fineLedger: { where: { status: "PENDING" } },
      },
    });
  },

  async getMemberById(id: string) {
    return prisma.libraryMember.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            student: true,
            teacher: true,
          },
        },
      },
    });
  },

  async createMember(userId: string, type: MemberType) {
    return prisma.libraryMember.create({
      data: {
        userId,
        memberType: type,
      },
    });
  },

  // --- Circulation ---
  async issueBook(libraryId: string, data: IssueBookInput) {
    const copy = await prisma.bookCopy.findFirst({
      where: {
        OR: [
          { id: data.bookCopyId },
          { barcode: data.bookCopyId },
          { book: { isbn: data.bookCopyId } },
        ],
        status: "AVAILABLE", // Important when scanning by ISBN to grab an available one
      },
      include: { book: true },
    });
    console.log(
      "ISSUE_DEBUG: Requested copyId",
      data.bookCopyId,
      "Found?",
      !!copy,
    );
    if (!copy)
      throw new Error("Copy not found with ID/Barcode " + data.bookCopyId);
    if (copy.status !== "AVAILABLE")
      throw new Error(
        "Book copy is not available (Status: " + copy.status + ")",
      );

    const policy = await prisma.libraryPolicy.findUnique({
      where: { libraryId },
    });
    if (!policy) throw new Error("Library policy not configured");

    const member = await prisma.libraryMember.findFirst({
      where: {
        OR: [
          { id: data.memberId },
          { user: { student: { admissionNo: data.memberId } } },
          { user: { teacher: { teacherSchoolId: data.memberId } } },
        ],
      },
    });
    if (!member) throw new Error("Member not found");
    if (member.status !== "ACTIVE") throw new Error("Member is not active");

    // Check limits
    const activeIssues = await prisma.issueTransaction.count({
      where: { memberId: member.id, status: { in: ["ISSUED", "OVERDUE"] } },
    });

    const limit =
      member.memberType === "TEACHER"
        ? policy.maxBooksTeacher
        : policy.maxBooksStudent;
    if (activeIssues >= limit)
      throw new Error(`Borrow limit reached (${limit})`);

    // Calculate Due Date
    const days =
      member.memberType === "TEACHER"
        ? policy.issueDaysTeacher
        : policy.issueDaysStudent;
    const dueDate =
      data.dueDate || new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const match = await prisma.$transaction([
      prisma.issueTransaction.create({
        data: {
          memberId: member.id,
          bookCopyId: copy.id,
          dueDate: dueDate,
          status: "ISSUED",
        },
      }),
      prisma.bookCopy.update({
        where: { id: copy.id },
        data: { status: "ISSUED" },
      }),
    ]);
    return match[0];
  },

  async getIssuedBooks(libraryId: string) {
    return prisma.issueTransaction.findMany({
      where: {
        status: "ISSUED",
        bookCopy: { book: { libraryId } },
      },
      include: {
        member: {
          include: { user: { include: { student: true, teacher: true } } },
        },
        bookCopy: { include: { book: true } },
      },
      orderBy: { dueDate: "asc" },
    });
  },

  async returnBookByBarcode(barcode: string) {
    const copy = await prisma.bookCopy.findUnique({
      where: { barcode },
      include: { book: true },
    });

    if (!copy) throw new Error("Copy not found with barcode: " + barcode);

    const activeTransaction = await prisma.issueTransaction.findFirst({
      where: {
        bookCopyId: copy.id,
        status: "ISSUED",
      },
    });

    if (!activeTransaction)
      throw new Error("No active issue transaction found for this barcode.");

    return this.returnBook(activeTransaction.id);
  },

  // --- Fines ---
  async getFines(libraryId: string) {
    return prisma.fineLedger.findMany({
      where: {
        member: {
          user: {
            schoolId: (
              await prisma.library.findUnique({ where: { id: libraryId } })
            )?.schoolId,
          },
        },
        status: "PENDING",
      },
      include: {
        member: { include: { user: true } },
        transaction: { include: { bookCopy: { include: { book: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async settleFine(fineId: string) {
    return prisma.fineLedger.update({
      where: { id: fineId },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
  },

  async returnBook(transactionId: string, providedLibraryId?: string) {
    const transaction = await prisma.issueTransaction.findUnique({
      where: { id: transactionId },
      include: { bookCopy: { include: { book: true } }, member: true },
    });
    if (!transaction || transaction.status === "RETURNED")
      throw new Error("Invalid transaction or already returned");

    const libraryId = transaction.bookCopy.book.libraryId;
    const policy = await prisma.libraryPolicy.findUnique({
      where: { libraryId },
    });

    const returnDate = new Date();
    let fine = 0;
    if (policy && returnDate > transaction.dueDate) {
      const diffTime = returnDate.getTime() - transaction.dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      if (diffDays > 0) {
        const chargeableDays = Math.max(0, diffDays - policy.fineGracePeriod);
        fine = chargeableDays * policy.finePerDay;
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.issueTransaction.update({
        where: { id: transactionId },
        data: {
          returnDate,
          status: "RETURNED",
          fineAmount: fine,
        },
      });

      await tx.bookCopy.update({
        where: { id: transaction.bookCopyId },
        data: { status: "AVAILABLE" },
      });

      if (fine > 0) {
        await tx.fineLedger.create({
          data: {
            memberId: transaction.memberId,
            transactionId: transaction.id,
            amount: fine,
            reason: `Overdue fine for ${transaction.bookCopy.book.title}`,
            status: "PENDING",
          },
        });
      }
      return updated;
    });
  },

  async getAllMembers(
    schoolId: string,
    filters?: { search?: string; classId?: string },
  ) {
    return prisma.libraryMember.findMany({
      where: {
        status: "ACTIVE",
        user: {
          schoolId: schoolId,
          AND: [
            filters?.search
              ? {
                  OR: [
                    { name: { contains: filters.search, mode: "insensitive" } },
                    {
                      email: { contains: filters.search, mode: "insensitive" },
                    },
                  ],
                }
              : {},
            filters?.classId
              ? {
                  student: {
                    classId: filters.classId,
                  },
                }
              : {},
          ],
        },
      },
      include: {
        user: {
          include: {
            student: {
              include: { class: true },
            },
            teacher: true,
          },
        },
        _count: {
          select: {
            transactions: { where: { status: "ISSUED" } },
            fineLedger: { where: { status: "PENDING" } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  },

  async deleteMember(memberId: string) {
    // Check for active transactions
    const activeLoans = await prisma.issueTransaction.count({
      where: { memberId, status: "ISSUED" },
    });
    if (activeLoans > 0) {
      throw new Error(
        "Cannot remove member with active book loans. Please return books first.",
      );
    }
    return prisma.libraryMember.delete({
      where: { id: memberId },
    });
  },

  async reserveBook(memberId: string, bookId: string) {
    return prisma.reservationQueue.create({
      data: {
        memberId,
        bookId,
        status: "PENDING",
      },
    });
  },
};
