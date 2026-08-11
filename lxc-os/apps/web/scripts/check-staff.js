
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaff() {
    const id = 'cmlbt8q8k0000j0v0wdo0gxs7';
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { school: true }
        });
        console.log('User found:', JSON.stringify(user, null, 2));
        
        if (user) {
            console.log('Role:', user.role);
            console.log('School ID:', user.schoolId);
        } else {
            console.log('User not found in database.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkStaff();
