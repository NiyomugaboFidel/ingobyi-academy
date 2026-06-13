import {
  AchievementTrigger,
  CourseStatus,
  CourseType,
  LessonType,
  OrganizationType,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding Ingobyi Academy...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const superadmin = await prisma.user.upsert({
    where: { email: 'super@ingobyi.com' },
    create: {
      email: 'super@ingobyi.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      platformRole: UserRole.SUPERADMIN,
      isVerified: true,
    },
    update: { passwordHash, isVerified: true },
  });

  const categories = await Promise.all(
    ['Technology', 'Business', 'Languages', 'Health', 'Arts'].map((name, i) =>
      prisma.courseCategory.upsert({
        where: { slug: name.toLowerCase() },
        create: { name, slug: name.toLowerCase() },
        update: {},
      }),
    ),
  );

  const testPassword = 'password123';

  const orgs = await Promise.all([
    prisma.organization.upsert({
      where: { slug: 'kigali-tech-school' },
      create: {
        name: 'Kigali Tech School',
        slug: 'kigali-tech-school',
        type: OrganizationType.SCHOOL,
        country: 'Rwanda',
        city: 'Kigali',
        isVerified: true,
      },
      update: {},
    }),
    prisma.organization.upsert({
      where: { slug: 'rwanda-training-center' },
      create: {
        name: 'Rwanda Training Center',
        slug: 'rwanda-training-center',
        type: OrganizationType.TRAINING_CENTER,
        country: 'Rwanda',
        city: 'Kigali',
        isVerified: true,
      },
      update: {},
    }),
  ]);

  const primaryOrg = orgs[0];

  const testAdmin = await prisma.user.upsert({
    where: { email: 'admin@ingobyi.com' },
    create: {
      email: 'admin@ingobyi.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Admin',
      isVerified: true,
    },
    update: { passwordHash, isVerified: true },
  });

  const testTrainer = await prisma.user.upsert({
    where: { email: 'trainer@ingobyi.com' },
    create: {
      email: 'trainer@ingobyi.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Trainer',
      isVerified: true,
    },
    update: { passwordHash, isVerified: true },
  });

  const testStudent = await prisma.user.upsert({
    where: { email: 'student@ingobyi.com' },
    create: {
      email: 'student@ingobyi.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Student',
      isVerified: true,
    },
    update: { passwordHash, isVerified: true },
  });

  const testParent = await prisma.user.upsert({
    where: { email: 'parent@ingobyi.com' },
    create: {
      email: 'parent@ingobyi.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Parent',
      isVerified: true,
    },
    update: { passwordHash, isVerified: true },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: testAdmin.id, orgId: primaryOrg.id } },
    create: { userId: testAdmin.id, orgId: primaryOrg.id, role: UserRole.ADMIN },
    update: { role: UserRole.ADMIN },
  });

  // Multi-org user: admin in primary org, student in secondary org (workspace switch testing)
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: testAdmin.id, orgId: orgs[1].id } },
    create: {
      userId: testAdmin.id,
      orgId: orgs[1].id,
      role: UserRole.STUDENT,
      joinedAt: new Date('2025-01-01'),
    },
    update: { role: UserRole.STUDENT },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: testTrainer.id, orgId: primaryOrg.id } },
    create: { userId: testTrainer.id, orgId: primaryOrg.id, role: UserRole.TRAINER },
    update: { role: UserRole.TRAINER },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: testStudent.id, orgId: primaryOrg.id } },
    create: { userId: testStudent.id, orgId: primaryOrg.id, role: UserRole.STUDENT },
    update: { role: UserRole.STUDENT },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: testParent.id, orgId: primaryOrg.id } },
    create: { userId: testParent.id, orgId: primaryOrg.id, role: UserRole.PARENT },
    update: { role: UserRole.PARENT },
  });

  await prisma.parentChildLink.upsert({
    where: { parentId_childId: { parentId: testParent.id, childId: testStudent.id } },
    create: {
      parentId: testParent.id,
      childId: testStudent.id,
      approvedAt: new Date(),
    },
    update: { approvedAt: new Date() },
  });

  for (const org of orgs) {
    const admin = await prisma.user.upsert({
      where: { email: `admin@${org.slug}.com` },
      create: {
        email: `admin@${org.slug}.com`,
        passwordHash,
        firstName: 'Org',
        lastName: 'Admin',
        isVerified: true,
      },
      update: { passwordHash },
    });

    await prisma.membership.upsert({
      where: { userId_orgId: { userId: admin.id, orgId: org.id } },
      create: { userId: admin.id, orgId: org.id, role: UserRole.ADMIN },
      update: {},
    });

    const trainers = [];
    for (let t = 1; t <= 2; t++) {
      const trainer = await prisma.user.upsert({
        where: { email: `trainer${t}@${org.slug}.com` },
        create: {
          email: `trainer${t}@${org.slug}.com`,
          passwordHash,
          firstName: `Trainer`,
          lastName: `${t}`,
          isVerified: true,
        },
        update: { passwordHash },
      });
      await prisma.membership.upsert({
        where: { userId_orgId: { userId: trainer.id, orgId: org.id } },
        create: { userId: trainer.id, orgId: org.id, role: UserRole.TRAINER },
        update: {},
      });
      trainers.push(trainer);
    }

    const students = [];
    for (let s = 1; s <= 5; s++) {
      const student = await prisma.user.upsert({
        where: { email: `student${s}@${org.slug}.com` },
        create: {
          email: `student${s}@${org.slug}.com`,
          passwordHash,
          firstName: `Student`,
          lastName: `${s}`,
          isVerified: true,
        },
        update: { passwordHash },
      });
      await prisma.membership.upsert({
        where: { userId_orgId: { userId: student.id, orgId: org.id } },
        create: { userId: student.id, orgId: org.id, role: UserRole.STUDENT },
        update: {},
      });
      students.push(student);
    }

    const statuses: CourseStatus[] = [
      CourseStatus.DRAFT,
      CourseStatus.PUBLISHED,
      CourseStatus.PUBLISHED,
    ];

    for (let c = 0; c < 3; c++) {
      const slug = `${org.slug}-course-${c + 1}`;
      const course = await prisma.course.upsert({
        where: { slug },
        create: {
          orgId: org.id,
          title: `${org.name} Course ${c + 1}`,
          slug,
          description: `Sample course ${c + 1} for ${org.name}`,
          shortDescription: `Learn skills in course ${c + 1}`,
          status: statuses[c],
          type: CourseType.SELF_PACED,
          categoryId: categories[c % categories.length].id,
          publishedAt: statuses[c] === CourseStatus.PUBLISHED ? new Date() : null,
          trainers: {
            create: { userId: trainers[0].id, isPrimary: true },
          },
        },
        update: { status: statuses[c] },
      });

      await prisma.courseChatRoom.upsert({
        where: { courseId: course.id },
        create: { courseId: course.id },
        update: {},
      });

      const mod = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: 'Module 1: Introduction',
          order: 1,
          isPublished: statuses[c] === CourseStatus.PUBLISHED,
          lessons: {
            create: [
              {
                title: 'Welcome Video',
                type: LessonType.VIDEO,
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                order: 1,
                isPublished: statuses[c] === CourseStatus.PUBLISHED,
                isFree: true,
              },
              {
                title: 'Getting Started',
                type: LessonType.TEXT,
                content: '<p>Welcome to the course!</p>',
                order: 2,
                isPublished: statuses[c] === CourseStatus.PUBLISHED,
              },
            ],
          },
        },
      });

      if (statuses[c] === CourseStatus.PUBLISHED) {
        for (const student of students) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: student.id, courseId: course.id } },
            create: { userId: student.id, courseId: course.id },
            update: {},
          });
        }
      }
    }
  }

  const publishedCourses = await prisma.course.findMany({
    where: { orgId: primaryOrg.id, status: CourseStatus.PUBLISHED },
    select: { id: true },
  });

  for (const course of publishedCourses) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: testStudent.id, courseId: course.id } },
      create: { userId: testStudent.id, courseId: course.id },
      update: {},
    });

    await prisma.courseTrainer.upsert({
      where: { courseId_userId: { courseId: course.id, userId: testTrainer.id } },
      create: { courseId: course.id, userId: testTrainer.id, isPrimary: false },
      update: {},
    });
  }

  await prisma.achievementDefinition.createMany({
    data: [
      {
        title: 'Course Champion',
        description: 'Complete your first course',
        trigger: AchievementTrigger.COURSE_COMPLETED,
        threshold: 1,
        points: 50,
      },
      {
        title: 'Streak Master',
        description: '7-day learning streak',
        trigger: AchievementTrigger.STREAK_DAYS,
        threshold: 7,
        points: 30,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.communityPost.createMany({
    data: [
      {
        authorId: testStudent.id,
        content: 'Just completed my first module in robotics! Excited to keep learning.',
        orgId: primaryOrg.id,
      },
      {
        authorId: testTrainer.id,
        content: 'Welcome to all new students this term. Feel free to ask questions in course chat.',
        orgId: primaryOrg.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.create({
    data: {
      title: 'Welcome to Ingobyi Academy',
      content:
        'Your multi-tenant learning platform is ready. Explore courses, join organizations, and start learning today!',
      scope: 'PLATFORM',
      authorId: superadmin.id,
      publishedAt: new Date(),
    },
  });

  console.log('Seed complete.');
  console.log('');
  console.log('Test accounts (password for all: ' + testPassword + ')');
  console.log('-------------------------------------------------------');
  console.log('SUPERADMIN  super@ingobyi.com');
  console.log('ADMIN       admin@ingobyi.com');
  console.log('TRAINER     trainer@ingobyi.com');
  console.log('STUDENT     student@ingobyi.com');
  console.log('PARENT      parent@ingobyi.com  (linked to student@ingobyi.com)');
  console.log('-------------------------------------------------------');
  console.log(`Primary org: ${primaryOrg.name} (${primaryOrg.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
