import { PrismaClient, Prisma, User, SportSession, Level, SessionStatus, Difficulty, WorkoutType } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/fr';
import bcrypt from 'bcryptjs';
import { mockWorkouts } from '../src/data/mockWorkouts';

const prisma = new PrismaClient();

const USERS_COUNT = 20;
const SESSIONS_COUNT = 15;

interface SportConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  teamsCount: number;
  playersPerTeam: number;
  indoor: boolean;
  equipment: readonly string[];
  popularLocations: readonly string[];
}

const sports: readonly SportConfig[] = [
  {
    id: faker.string.uuid(),
    name: "Football",
    icon: "⚽️",
    description: "Le sport le plus populaire au monde",
    minPlayers: 6,
    maxPlayers: 10,
    teamsCount: 2,
    playersPerTeam: 5,
    indoor: false,
    equipment: ["ballon", "crampons", "protège-tibias"],
    popularLocations: ["stade", "terrain municipal", "city stade"]
  },
  {
    id: faker.string.uuid(),
    name: "Basketball",
    icon: "🏀",
    description: "Un sport dynamique et spectaculaire",
    minPlayers: 4,
    maxPlayers: 6,
    teamsCount: 2,
    playersPerTeam: 3,
    indoor: true,
    equipment: ["ballon", "chaussures de basket"],
    popularLocations: ["gymnase", "terrain extérieur", "playground"]
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: '🎾',
    description: 'Sport de raquette qui se joue en double sur un terrain vitré.',
    minPlayers: 4,
    maxPlayers: 4,
    teamsCount: 2,
    playersPerTeam: 2,
    indoor: true,
    equipment: ['raquette de padel', 'balles de padel', 'chaussures indoor'] as const,
    popularLocations: ['club de padel', 'complexe indoor'] as const
  },
] as const;

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const sessionStatuses = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

async function generateUsers(count: number): Promise<Prisma.UserCreateInput[]> {
  const users: Prisma.UserCreateInput[] = [];
  for (let i = 0; i < count; i++) {
    const user: Prisma.UserCreateInput = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: await bcrypt.hash('password123', 10),
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
      bio: faker.lorem.paragraph(),
      level: levels[Math.floor(Math.random() * levels.length)] as Level
    };
    users.push(user);
  }
  return users;
}

async function generateSessions(users: Prisma.UserCreateInput[], count: number): Promise<Prisma.SportSessionCreateInput[]> {
  const sessions: Prisma.SportSessionCreateInput[] = [];
  
  for (let i = 0; i < count; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const host = users[Math.floor(Math.random() * users.length)];
    const location = {
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      address: faker.location.streetAddress(),
      city: faker.location.city()
    };

    // Sélectionner aléatoirement des participants (entre 2 et maxPlayers-1)
    const participantsCount = Math.floor(Math.random() * (sport.maxPlayers - 2)) + 2;
    const participants = users
      .filter(u => u.id !== host.id) // Exclure l'hôte
      .sort(() => Math.random() - 0.5) // Mélanger
      .slice(0, participantsCount); // Prendre un nombre aléatoire de participants

    const session: Prisma.SportSessionCreateInput = {
      id: faker.string.uuid(),
      sport: { connect: { id: sport.id } },
      host: { connect: { id: host.id } },
      location: JSON.parse(JSON.stringify(location)) as Prisma.JsonObject,
      dateTime: faker.date.future(),
      duration: Math.floor(Math.random() * 120) + 30,
      maxPlayers: sport.maxPlayers || 10,
      level: levels[Math.floor(Math.random() * levels.length)] as Level,
      description: faker.lorem.paragraph(),
      status: sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)] as SessionStatus,
      participants: {
        connect: participants.map(p => ({ id: p.id }))
      },
      teams: {
        create: Array.from({ length: sport.teamsCount }, (_, index) => ({
          id: faker.string.uuid(),
          name: `Équipe ${index + 1}`,
          players: {
            connect: participants
              .slice(index * sport.playersPerTeam, (index + 1) * sport.playersPerTeam)
              .map(p => ({ id: p.id }))
          }
        }))
      }
    };
    sessions.push(session);
  }
  return sessions;
}

async function main() {
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.workoutProgress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.team.deleteMany();
  await prisma.sportSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sport.deleteMany();

  console.log('👤 Création de l\'utilisateur admin...');
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin',
      email: 'admin@sportly.com',
      name: 'Admin Sportly',
      password: await bcrypt.hash('admin123', 10),
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
      bio: 'Administrateur de la plateforme Sportly',
      level: 'ADVANCED' as Level
    }
  });
  console.log('✅ Utilisateur admin créé:', adminUser.email);

  console.log('🌱 Création des sports...');
  const createdSports = await Promise.all(
    sports.map(sport => prisma.sport.create({ 
      data: {
        id: sport.id,
        name: sport.name,
        icon: sport.icon,
        description: sport.description,
        minPlayers: sport.minPlayers,
        maxPlayers: sport.maxPlayers,
        teamsCount: sport.teamsCount,
        playersPerTeam: sport.playersPerTeam,
        indoor: sport.indoor,
        equipment: sport.equipment as string[],
        popularLocations: sport.popularLocations as string[]
      } 
    }))
  );

  console.log('👥 Création des utilisateurs...');
  const users = await generateUsers(USERS_COUNT);
  const createdUsers = await Promise.all(
    users.map(user => prisma.user.create({ data: user }))
  );
  console.log(`✅ ${createdUsers.length} utilisateurs créés`);

  console.log('🎮 Création des sessions...');
  const sessions = await generateSessions(users, SESSIONS_COUNT);
  const createdSessions = await Promise.all(
    sessions.map(session => prisma.sportSession.create({ data: session }))
  );
  console.log(`✅ ${createdSessions.length} sessions créées`);

  // Créer l'utilisateur par défaut
  const defaultUser = await prisma.user.create({
    data: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: 'Passionné de sport et de bien-être',
      level: Level.INTERMEDIATE
    }
  });

  console.log('✅ Utilisateur par défaut créé:', defaultUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 