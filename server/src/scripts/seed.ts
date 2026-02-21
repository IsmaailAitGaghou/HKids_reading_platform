import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";
import { connectDatabase } from "../config/database";
import { ROLES } from "../types/auth";
import { slugify } from "../utils/slug";
import { AgeGroupModel } from "../modules/age-groups/age-group.model";
import { UserModel } from "../modules/auth/auth.model";
import { BookModel } from "../modules/books/book.model";
import { CategoryModel } from "../modules/categories/category.model";
import { ChildPolicyModel } from "../modules/children/child-policy.model";
import { ChildModel } from "../modules/children/child.model";
import { ReadingSessionModel } from "../modules/children/reading-session.model";

interface SeedBookInput {
  title: string;
  summary: string;
  coverImageUrl: string;
  ageGroupName: string;
  categories: string[];
  tags: string[];
  pages: Array<{ 
    title: string; 
    text: string; 
    imageUrl?: string; 
    narrationUrl?: string 
  }>;
  status: "draft" | "published";
  visibility: "private" | "public";
}

interface SeedAgeGroupRef {
  _id: Types.ObjectId;
  name: string;
}

interface SeedCategoryRef {
  _id: Types.ObjectId;
  name: string;
}

interface SeedBookRef {
  _id: Types.ObjectId;
  title: string;
}

const clearExistingData = async (): Promise<void> => {
  console.log("🗑️  Clearing existing data...");
  await ReadingSessionModel.deleteMany({});
  await ChildPolicyModel.deleteMany({});
  await ChildModel.deleteMany({});
  await BookModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await AgeGroupModel.deleteMany({});
  await UserModel.deleteMany({});
  console.log("✅ Data cleared");
};

const seedUsers = async () => {
  console.log("👥 Seeding users...");
  const [adminPasswordHash, parent1PasswordHash, parent2PasswordHash] = await Promise.all([
    bcrypt.hash("Admin123", 12),
    bcrypt.hash("Parent123", 12),
    bcrypt.hash("Parent456", 12)
  ]);

  const admin = await UserModel.create({
    name: "HKids Admin",
    email: "admin@hkids.com",
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN
  });

  const parent1 = await UserModel.create({
    name: "Sarah Johnson",
    email: "sarah@hkids.com",
    passwordHash: parent1PasswordHash,
    role: ROLES.PARENT
  });

  const parent2 = await UserModel.create({
    name: "Michael Chen",
    email: "michael@hkids.com",
    passwordHash: parent2PasswordHash,
    role: ROLES.PARENT
  });

  console.log("✅ Users created");
  return { admin, parent1, parent2 };
};

const seedAgeGroups = async (): Promise<Map<string, SeedAgeGroupRef>> => {
  console.log("📚 Seeding age groups...");
  const groups = await AgeGroupModel.insertMany([
    {
      name: "Toddlers & Pre-K",
      minAge: 2,
      maxAge: 4,
      description: "Perfect for our youngest readers with simple stories and bright pictures",
      isActive: true,
      sortOrder: 1
    },
    {
      name: "Little Explorers",
      minAge: 3,
      maxAge: 5,
      description: "Early years visual stories with engaging illustrations",
      isActive: true,
      sortOrder: 2
    },
    {
      name: "Early Readers",
      minAge: 6,
      maxAge: 8,
      description: "Short chapters and beginner vocabulary for developing readers",
      isActive: true,
      sortOrder: 3
    },
    {
      name: "Junior Readers",
      minAge: 9,
      maxAge: 12,
      description: "Longer stories with richer themes and complex vocabulary",
      isActive: true,
      sortOrder: 4
    },
    {
      name: "Young Adults",
      minAge: 13,
      maxAge: 17,
      description: "Mature content for teenage readers exploring deeper topics",
      isActive: true,
      sortOrder: 5
    },
    {
      name: "All Ages",
      minAge: 2,
      maxAge: 17,
      description: "Stories that everyone can enjoy together",
      isActive: true,
      sortOrder: 6
    }
  ]);

  console.log(`✅ Created ${groups.length} age groups`);
  return new Map(groups.map((group) => [group.name, { _id: group._id, name: group.name }]));
};

const seedCategories = async (): Promise<Map<string, SeedCategoryRef>> => {
  console.log("🏷️  Seeding categories...");
  const names = [
    { name: "Animals & Nature", description: "Friendly animal stories and nature adventures", sortOrder: 1, isActive: true },
    { name: "Space & Science", description: "Adventures among stars and scientific discoveries", sortOrder: 2, isActive: true },
    { name: "Fairy Tales", description: "Magic, wonder, and timeless tales", sortOrder: 3, isActive: true },
    { name: "Mystery & Detective", description: "Gentle detective stories and puzzles to solve", sortOrder: 4, isActive: true },
    { name: "Adventure", description: "Exciting journeys and brave explorations", sortOrder: 5, isActive: true },
    { name: "Friendship", description: "Stories about making friends and working together", sortOrder: 6, isActive: true },
    { name: "History & Culture", description: "Learn about different times and places", sortOrder: 7, isActive: true },
    { name: "Fantasy", description: "Magical worlds and imaginary creatures", sortOrder: 8, isActive: true },
    { name: "Sports & Activities", description: "Stories about sports, games, and being active", sortOrder: 9, isActive: true },
    { name: "Family", description: "Heartwarming stories about family love", sortOrder: 10, isActive: true }
  ];

  const categories = await CategoryModel.insertMany(
    names.map((item) => ({
      ...item,
      slug: slugify(item.name)
    }))
  );

  console.log(`✅ Created ${categories.length} categories`);
  return new Map(categories.map((category) => [category.name, { _id: category._id, name: category.name }]));
};

const seedBooks = async (
  adminId: Types.ObjectId,
  ageGroups: Map<string, SeedAgeGroupRef>,
  categories: Map<string, SeedCategoryRef>
): Promise<SeedBookRef[]> => {
  console.log("📖 Seeding books...");
  const booksData: SeedBookInput[] = [
    {
      title: "The Brave Little Lion and the Hidden River",
      summary: "Leo the lion discovers that true courage isn't about being fearless—it's about facing your fears with a kind heart. A heartwarming tale of bravery and self-discovery.",
      coverImageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Early Readers",
      categories: ["Animals & Nature", "Adventure"],
      tags: ["courage", "animals", "nature", "self-discovery"],
      pages: [
        { 
          title: "A Quiet Morning", 
          text: "Leo woke up before sunrise. The forest was still and peaceful. He could hear birds beginning to chirp in the trees. Today felt different, like something special was about to happen.",
          imageUrl: "https://images.unsplash.com/photo-1516642898728-e681c75df36c?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "The Whispering Path", 
          text: "A tiny blue bird landed on a branch near Leo. 'Follow me,' she chirped. 'I know a secret path that no lion has ever walked before.' Leo's heart beat faster with excitement.",
          imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "The Hidden River", 
          text: "Through the bushes, Leo heard rushing water. The river was wider and faster than any he had seen. His paws felt shaky, but he remembered what his mother once said: 'Being brave means trying, even when you're scared.'",
          imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "A New Story", 
          text: "Leo took a deep breath and stepped into the water. It was cold but refreshing. With careful steps, he made it across. On the other side, the little bird sang a happy song. Leo had found his courage, and he couldn't wait to share this adventure with his friends.",
          imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "Elephant Splash!",
      summary: "On the hottest day of summer, Nora the elephant creates the best pool party the jungle has ever seen! A fun story about sharing joy with friends.",
      coverImageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Little Explorers",
      categories: ["Animals & Nature", "Friendship"],
      tags: ["friendship", "fun", "animals", "summer"],
      pages: [
        { 
          title: "Hot Noon", 
          text: "The sun was very hot. All the animals were tired and warm. They sat in the shade of the big trees. Everyone wished for something cool.",
          imageUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "Water Time", 
          text: "Nora the elephant walked to the river. She filled her trunk with cold water. Then she sprayed it high into the sky! The water came down like rain.",
          imageUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "Big Laughs", 
          text: "All the animals ran to play in the water! The monkeys danced, the zebras jumped, and the birds sang. Everyone was laughing and splashing together. It was the best day ever!",
          imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "Journey to Mars",
      summary: "Mia dreams of becoming an astronaut. When she finally gets her chance to visit Mars, she discovers that curiosity and asking questions are just as important as the answers.",
      coverImageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Junior Readers",
      categories: ["Space & Science", "Adventure"],
      tags: ["space", "learning", "science", "exploration"],
      pages: [
        { 
          title: "Launch Day", 
          text: "Mia stood at the window of the spacecraft, watching Earth get smaller. She had dreamed of this moment her whole life. The rocket engines hummed as they pushed toward the red planet. 'We'll be there in six months,' said Commander Rodriguez with a smile.",
          imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "In Orbit", 
          text: "The days in space passed slowly. Mia learned to float, to eat space food, and to work with the crew. Every night she wrote in her journal and looked at the stars through the window. She had so many questions about the universe.",
          imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "First Step", 
          text: "The landing was bumpy but safe. Mia put on her spacesuit and stepped out onto Mars. The red dust crunched under her boots. She picked up a rock and held it carefully. This rock had been sitting here for millions of years, and now it was in her hands. She realized that every question answered led to ten new questions—and that was the most exciting thing of all.",
          imageUrl: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "Moon Shadows",
      summary: "Leo notices mysterious shadows dancing on his bedroom wall at night. With the help of moonlight and a little courage, he uncovers a magical secret.",
      coverImageUrl: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Early Readers",
      categories: ["Mystery & Detective", "Fairy Tales", "Fantasy"],
      tags: ["bedtime", "mystery", "magic", "adventure"],
      pages: [
        { 
          title: "A Strange Shape", 
          text: "Leo was getting ready for bed when he saw something odd. A shadow danced across his wall near the bookshelf. It looked like a tiny person doing ballet!",
          imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "Tiny Clues", 
          text: "The next morning, Leo searched his room. He found a trail of silver glitter, a small feather, and a bell no bigger than a button. Someone—or something—had definitely been visiting.",
          imageUrl: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        },
        { 
          title: "The Reveal", 
          text: "That night, Leo stayed awake and waited. When the moon shone through his window, a magical fairy cat appeared! She wore a tiny tutu and danced gracefully in the moonlight. 'I practice here every night,' she purred. 'Would you like to watch?' Leo smiled and nodded. From that night on, he had the best bedtime show in the whole world.",
          imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=800&q=80",
          narrationUrl: ""
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "The Secret Garden Adventure",
      summary: "Emma discovers a hidden door in her grandmother's garden wall. Behind it lies a magical world where flowers can talk and butterflies know ancient secrets.",
      coverImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Early Readers",
      categories: ["Fantasy", "Adventure", "Animals & Nature"],
      tags: ["magic", "garden", "discovery", "nature"],
      pages: [
        { 
          title: "The Hidden Door", 
          text: "Emma was playing in Grandma's garden when she noticed ivy growing on the old stone wall. She pushed the vines aside and gasped—there was a small wooden door she had never seen before!",
          imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "A Talking Rose", 
          text: "Behind the door was a garden more beautiful than any Emma had imagined. A rose with petals like rubies spoke to her: 'Welcome, young explorer. We've been waiting for someone with a kind heart.'",
          imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Butterfly's Wisdom", 
          text: "A golden butterfly landed on Emma's shoulder. 'This garden has been here for a thousand years,' it whispered. 'It appears only to those who believe in magic and promise to protect nature.'",
          imageUrl: "https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Promise", 
          text: "Emma made a promise to visit every day and help the magical garden grow. As she stepped back through the door, she knew she had found something special—a secret world that was now her responsibility to protect.",
          imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "The Soccer Star's Big Game",
      summary: "Carlos has practiced all season for the championship match. But when his best friend gets injured, he must learn that being a true team player means more than scoring goals.",
      coverImageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Junior Readers",
      categories: ["Sports & Activities", "Friendship"],
      tags: ["soccer", "teamwork", "friendship", "sports"],
      pages: [
        { 
          title: "Practice Makes Perfect", 
          text: "Every day after school, Carlos practiced soccer in the park. He could dribble around cones, pass with precision, and shoot goals from halfway across the field. The championship game was only three days away, and he was ready.",
          imageUrl: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Bad News", 
          text: "At practice the next day, disaster struck. Miguel, the team's best defender and Carlos's best friend, twisted his ankle. The coach said he couldn't play in the big game. Miguel looked so sad, and Carlos felt his excitement fade too.",
          imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "A New Plan", 
          text: "That night, Carlos had an idea. He visited Miguel with a notebook and pen. 'You can't run, but you can still help us win,' he said. Together they watched videos of the other team and created a strategy. Miguel knew the game better than anyone.",
          imageUrl: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Championship Victory", 
          text: "On game day, Miguel sat on the bench calling out plays. Carlos and the team followed his strategy perfectly. They worked together, passed to open players, and supported each other. When Carlos scored the winning goal, he ran straight to Miguel. 'We did it together!' he shouted. The whole team celebrated—because they had learned that everyone's contribution matters.",
          imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "Grandpa's Treasure Map",
      summary: "When Lily finds an old map in Grandpa's attic, it leads her on a journey through family history, teaching her that the greatest treasures aren't always made of gold.",
      coverImageUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Junior Readers",
      categories: ["Family", "Adventure", "History & Culture"],
      tags: ["family", "treasure hunt", "history", "memories"],
      pages: [
        { 
          title: "The Attic Discovery", 
          text: "Lily was helping Grandpa clean the attic when she found an old wooden box. Inside was a yellowed map with drawings and symbols. 'I made this when I was your age,' Grandpa said with a twinkle in his eye.",
          imageUrl: "https://images.unsplash.com/photo-1594733537894-fa2e5956a440?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Following the Clues", 
          text: "The map led to different places around town—the old library, the park fountain, the bakery where Grandpa worked as a boy. At each stop, Grandpa shared a story from his childhood. Lily learned about his first friend, his favorite teacher, and the summer he learned to swim.",
          imageUrl: "https://images.unsplash.com/photo-1495954222046-2c427ecb546d?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Final Location", 
          text: "The last X on the map marked a big oak tree in Grandpa's backyard. Lily dug carefully where Grandpa pointed. She found a metal box buried in the dirt. Inside were old photographs, letters, and a small medal.",
          imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Real Treasure", 
          text: "'These are memories,' Grandpa explained, holding up a photo of his parents. 'Stories and family are the most valuable treasures we have.' Lily hugged him tight. She realized that today's adventure was creating new memories—and those would be treasures she'd keep forever.",
          imageUrl: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "The Dragon Who Couldn't Breathe Fire",
      summary: "Spark is different from other dragons—instead of fire, he breathes beautiful rainbow bubbles. At first he's embarrassed, but soon he discovers that being different is his greatest strength.",
      coverImageUrl: "https://images.unsplash.com/photo-1589802829585-2f97e79dde0b?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Little Explorers",
      categories: ["Fantasy", "Friendship"],
      tags: ["dragons", "self-acceptance", "friendship", "magic"],
      pages: [
        { 
          title: "Dragon School", 
          text: "All the young dragons were learning to breathe fire. Blaze made huge flames. Storm created fire tornadoes. But when Spark tried, only colorful bubbles came out. The other dragons laughed.",
          imageUrl: "https://images.unsplash.com/photo-1517810532-2f02b9c81d2d?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Feeling Sad", 
          text: "Spark flew away to a quiet cave. He felt sad and different. 'Why can't I be like everyone else?' he wondered. A wise old owl heard him crying. 'Being different isn't bad,' she hooted. 'You just haven't found your special gift yet.'",
          imageUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Big Storm", 
          text: "Dark clouds covered the sky. Rain poured down. A forest fire started from lightning! The dragons tried to help but their fire made it worse. Then Spark had an idea. He blew his rainbow bubbles at the flames.",
          imageUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "A Hero's Bubbles", 
          text: "Spark's magical bubbles put out the fire and made a beautiful rainbow in the sky! All the animals cheered. The other dragons apologized for laughing. 'You saved everyone!' said Blaze. Spark smiled. Being different made him special after all.",
          imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "The Time-Traveling Lunchbox",
      summary: "Jake's new lunchbox has a secret—it can transport him to different time periods during lunch break! But he must get back before the bell rings or be stuck in history forever.",
      coverImageUrl: "https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Junior Readers",
      categories: ["Adventure", "History & Culture", "Fantasy"],
      tags: ["time travel", "history", "adventure", "magic"],
      pages: [
        { 
          title: "The Strange Gift", 
          text: "Jake's grandmother gave him an old lunchbox covered in strange symbols. 'This belonged to your great-grandfather,' she said mysteriously. 'Use it wisely.' At school the next day, when Jake opened it at lunch, the cafeteria disappeared!",
          imageUrl: "https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Ancient Egypt", 
          text: "Jake found himself standing near the pyramids! Workers were moving giant stones. A friendly Egyptian boy named Amani shared his bread and dates. 'You're dressed funny,' Amani laughed. Jake learned how the pyramids were built and watched scribes write in hieroglyphics.",
          imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Medieval Knights", 
          text: "The next day, Jake opened the lunchbox and arrived at a castle! He met a young squire learning to become a knight. They practiced sword fighting with wooden swords and watched a jousting tournament. The food was different than Jake expected—lots of bread and stew.",
          imageUrl: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The Close Call", 
          text: "On Friday, Jake visited the Wild West and almost missed the return! He heard the school bell ringing from far away and quickly closed the lunchbox. He appeared back in the cafeteria with just seconds to spare. Jake smiled—he couldn't wait for next week's lunch break adventure!",
          imageUrl: "https://images.unsplash.com/photo-1509803874385-db7c23652552?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "published",
      visibility: "public"
    },
    {
      title: "The Lonely Robot",
      summary: "CHIP is a robot who works in a factory. He's efficient and never makes mistakes, but he's lonely. When he meets a creative painter robot, he learns that making art and making friends is just as important as making things.",
      coverImageUrl: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
      ageGroupName: "Early Readers",
      categories: ["Space & Science", "Friendship"],
      tags: ["robots", "friendship", "creativity", "technology"],
      pages: [
        { 
          title: "The Factory Floor", 
          text: "CHIP worked in the toy factory making the same things every day. Beep beep! He welded wheels. Beep beep! He painted doors. All the other robots worked quietly too. No one ever talked.",
          imageUrl: "https://images.unsplash.com/photo-1561144257-e32e6e4c0b2d?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "The New Arrival", 
          text: "One day, a new robot named DAISY rolled onto the factory floor. But instead of working on toys, she painted pictures on her screen! She painted flowers, rainbows, and stars. CHIP was curious. He had never seen anything like this before.",
          imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "Learning to Create", 
          text: "'Why do you paint?' CHIP asked. 'It makes me happy!' DAISY replied. 'Want to try?' She showed CHIP how to mix colors and make shapes. At first CHIP's paintings looked like factory blueprints. But slowly, they became more colorful and fun.",
          imageUrl: "https://images.unsplash.com/photo-1482245294234-b3f2f8d5f1a4?auto=format&fit=crop&w=800&q=80"
        },
        { 
          title: "A Colorful Factory", 
          text: "Soon, all the robots were painting during their breaks! They decorated the factory walls with art. CHIP realized that making friends and creating beautiful things made him just as happy as doing his job well. The factory became the most cheerful place in the whole city.",
          imageUrl: "https://images.unsplash.com/photo-1523368177135-7f3a0732c5ae?auto=format&fit=crop&w=800&q=80"
        }
      ],
      status: "draft",
      visibility: "private"
    }
  ];

  const books: SeedBookRef[] = [];
  for (const item of booksData) {
    const ageGroup = ageGroups.get(item.ageGroupName);
    if (!ageGroup) {
      throw new Error(`Missing age group: ${item.ageGroupName}`);
    }

    const categoryIds = item.categories.map((name) => {
      const category = categories.get(name);
      if (!category) {
        throw new Error(`Missing category: ${name}`);
      }
      return category._id;
    });

    const pages = item.pages.map((page, index) => ({
      pageNumber: index + 1,
      title: page.title || "",
      text: page.text,
      imageUrl: page.imageUrl || "",
      narrationUrl: page.narrationUrl || ""
    }));

    const isPublished = item.status === "published";
    const book = await BookModel.create({
      title: item.title,
      slug: slugify(item.title),
      summary: item.summary,
      coverImageUrl: item.coverImageUrl,
      ageGroupId: ageGroup._id,
      categoryIds,
      tags: item.tags,
      pages,
      visibility: item.visibility,
      isApproved: isPublished,
      status: item.status,
      publishedAt: isPublished ? new Date() : undefined,
      createdBy: adminId,
      updatedBy: adminId
    });
    books.push({ _id: book._id, title: book.title });
  }

  console.log(`✅ Created ${books.length} books`);
  return books;
};

const seedChildrenAndPolicies = async (
  parent1Id: Types.ObjectId,
  parent2Id: Types.ObjectId,
  ageGroups: Map<string, SeedAgeGroupRef>,
  categories: Map<string, SeedCategoryRef>
) => {
  console.log("👶 Seeding children and policies...");
  
  const earlyReaders = ageGroups.get("Early Readers");
  const littleExplorers = ageGroups.get("Little Explorers");
  const juniorReaders = ageGroups.get("Junior Readers");
  const toddlers = ageGroups.get("Toddlers & Pre-K");
  
  if (!earlyReaders || !littleExplorers || !juniorReaders || !toddlers) {
    throw new Error("Required age groups not found");
  }

  // Hash PINs for children
  const [leoPinHash, miaPinHash, sophiePinHash, jackPinHash] = await Promise.all([
    bcrypt.hash("1234", 12), 
    bcrypt.hash("2468", 12),
    bcrypt.hash("5678", 12),
    bcrypt.hash("9999", 12)
  ]);

  // Parent 1 children (Sarah Johnson)
  const leo = await ChildModel.create({
    parentId: parent1Id,
    name: "Leo",
    age: 7,
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Leo",
    ageGroupId: earlyReaders._id,
    pinHash: leoPinHash,
    isActive: true
  });

  const mia = await ChildModel.create({
    parentId: parent1Id,
    name: "Mia",
    age: 4,
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mia",
    ageGroupId: littleExplorers._id,
    pinHash: miaPinHash,
    isActive: true
  });

  // Parent 2 children (Michael Chen)
  const sophie = await ChildModel.create({
    parentId: parent2Id,
    name: "Sophie",
    age: 10,
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Sophie",
    ageGroupId: juniorReaders._id,
    pinHash: sophiePinHash,
    isActive: true
  });

  const jack = await ChildModel.create({
    parentId: parent2Id,
    name: "Jack",
    age: 3,
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Jack",
    ageGroupId: toddlers._id,
    pinHash: jackPinHash,
    isActive: false  // Inactive child for testing
  });

  // Get category IDs
  const animals = categories.get("Animals & Nature");
  const space = categories.get("Space & Science");
  const fairyTales = categories.get("Fairy Tales");
  const mystery = categories.get("Mystery & Detective");
  const adventure = categories.get("Adventure");
  const friendship = categories.get("Friendship");
  const fantasy = categories.get("Fantasy");
  const sports = categories.get("Sports & Activities");
  
  if (!animals || !space || !fairyTales || !mystery || !adventure || !friendship || !fantasy || !sports) {
    throw new Error("Required categories not found");
  }

  // Create policies for each child
  await ChildPolicyModel.create({
    childId: leo._id,
    allowedCategoryIds: [animals._id, space._id, adventure._id, mystery._id],
    allowedAgeGroupIds: [earlyReaders._id, littleExplorers._id],
    dailyLimitMinutes: 35,
    schedule: { start: "16:00", end: "20:30" }
  });

  await ChildPolicyModel.create({
    childId: mia._id,
    allowedCategoryIds: [animals._id, fairyTales._id, friendship._id, fantasy._id],
    allowedAgeGroupIds: [littleExplorers._id, toddlers._id],
    dailyLimitMinutes: 20,
    schedule: { start: "15:00", end: "18:00" }
  });

  await ChildPolicyModel.create({
    childId: sophie._id,
    allowedCategoryIds: [space._id, adventure._id, mystery._id, fantasy._id, sports._id],
    allowedAgeGroupIds: [juniorReaders._id, earlyReaders._id],
    dailyLimitMinutes: 60,
    schedule: { start: "17:00", end: "21:00" }
  });

  await ChildPolicyModel.create({
    childId: jack._id,
    allowedCategoryIds: [animals._id, friendship._id],
    allowedAgeGroupIds: [toddlers._id],
    dailyLimitMinutes: 15
    // No schedule - allowing reading anytime
  });

  console.log("✅ Created 4 children with policies");
  return { leo, mia, sophie, jack };
};

const seedReadingSessions = async (
  parent1Id: Types.ObjectId,
  parent2Id: Types.ObjectId,
  children: { 
    leo: { _id: Types.ObjectId }; 
    mia: { _id: Types.ObjectId }; 
    sophie: { _id: Types.ObjectId };
    jack: { _id: Types.ObjectId };
  },
  books: SeedBookRef[]
) => {
  console.log("📊 Seeding reading sessions...");
  
  const lionBook = books.find((book) => book.title.includes("Lion"));
  const elephantBook = books.find((book) => book.title.includes("Elephant"));
  const marsBook = books.find((book) => book.title.includes("Mars"));
  const moonShadowsBook = books.find((book) => book.title.includes("Moon Shadows"));
  const gardenBook = books.find((book) => book.title.includes("Garden"));
  const soccerBook = books.find((book) => book.title.includes("Soccer"));
  const dragonBook = books.find((book) => book.title.includes("Dragon"));
  
  if (!lionBook || !elephantBook || !marsBook || !moonShadowsBook || !gardenBook || !soccerBook || !dragonBook) {
    throw new Error("Required books not found for sessions");
  }

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const oneMinute = 60 * 1000;

  const sessions = [
    // Leo's reading sessions (Parent 1)
    {
      childId: children.leo._id,
      parentId: parent1Id,
      bookId: lionBook._id,
      startedAt: new Date(now.getTime() - 3 * oneDay - 4 * oneHour),
      endedAt: new Date(now.getTime() - 3 * oneDay - 4 * oneHour + 22 * oneMinute),
      minutes: 22,
      pagesRead: [0, 1, 2, 3],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 3 * oneDay - 4 * oneHour + 3 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 3 * oneDay - 4 * oneHour + 7 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - 3 * oneDay - 4 * oneHour + 13 * oneMinute) },
        { pageIndex: 3, at: new Date(now.getTime() - 3 * oneDay - 4 * oneHour + 18 * oneMinute) }
      ]
    },
    {
      childId: children.leo._id,
      parentId: parent1Id,
      bookId: moonShadowsBook._id,
      startedAt: new Date(now.getTime() - 2 * oneDay - 3 * oneHour),
      endedAt: new Date(now.getTime() - 2 * oneDay - 3 * oneHour + 18 * oneMinute),
      minutes: 18,
      pagesRead: [0, 1, 2],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 2 * oneDay - 3 * oneHour + 4 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 2 * oneDay - 3 * oneHour + 9 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - 2 * oneDay - 3 * oneHour + 14 * oneMinute) }
      ]
    },
    {
      childId: children.leo._id,
      parentId: parent1Id,
      bookId: gardenBook._id,
      startedAt: new Date(now.getTime() - oneDay - 5 * oneHour),
      endedAt: new Date(now.getTime() - oneDay - 5 * oneHour + 25 * oneMinute),
      minutes: 25,
      pagesRead: [0, 1, 2, 3],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - oneDay - 5 * oneHour + 5 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - oneDay - 5 * oneHour + 10 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - oneDay - 5 * oneHour + 16 * oneMinute) },
        { pageIndex: 3, at: new Date(now.getTime() - oneDay - 5 * oneHour + 22 * oneMinute) }
      ]
    },

    // Mia's reading sessions (Parent 1)
    {
      childId: children.mia._id,
      parentId: parent1Id,
      bookId: elephantBook._id,
      startedAt: new Date(now.getTime() - 2 * oneDay - oneHour),
      endedAt: new Date(now.getTime() - 2 * oneDay - oneHour + 12 * oneMinute),
      minutes: 12,
      pagesRead: [0, 1, 2],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 2 * oneDay - oneHour + 2 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 2 * oneDay - oneHour + 5 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - 2 * oneDay - oneHour + 9 * oneMinute) }
      ]
    },
    {
      childId: children.mia._id,
      parentId: parent1Id,
      bookId: dragonBook._id,
      startedAt: new Date(now.getTime() - oneDay - 2 * oneHour),
      endedAt: new Date(now.getTime() - oneDay - 2 * oneHour + 15 * oneMinute),
      minutes: 15,
      pagesRead: [0, 1, 2, 3],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - oneDay - 2 * oneHour + 3 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - oneDay - 2 * oneHour + 6 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - oneDay - 2 * oneHour + 10 * oneMinute) },
        { pageIndex: 3, at: new Date(now.getTime() - oneDay - 2 * oneHour + 13 * oneMinute) }
      ]
    },
    {
      childId: children.mia._id,
      parentId: parent1Id,
      bookId: elephantBook._id,
      startedAt: new Date(now.getTime() - 3 * oneHour),
      endedAt: new Date(now.getTime() - 3 * oneHour + 10 * oneMinute),
      minutes: 10,
      pagesRead: [0, 1],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 3 * oneHour + 4 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 3 * oneHour + 8 * oneMinute) }
      ]
    },

    // Sophie's reading sessions (Parent 2)
    {
      childId: children.sophie._id,
      parentId: parent2Id,
      bookId: marsBook._id,
      startedAt: new Date(now.getTime() - 4 * oneDay - 2 * oneHour),
      endedAt: new Date(now.getTime() - 4 * oneDay - 2 * oneHour + 28 * oneMinute),
      minutes: 28,
      pagesRead: [0, 1, 2],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 4 * oneDay - 2 * oneHour + 8 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 4 * oneDay - 2 * oneHour + 16 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - 4 * oneDay - 2 * oneHour + 24 * oneMinute) }
      ]
    },
    {
      childId: children.sophie._id,
      parentId: parent2Id,
      bookId: soccerBook._id,
      startedAt: new Date(now.getTime() - 2 * oneDay - 4 * oneHour),
      endedAt: new Date(now.getTime() - 2 * oneDay - 4 * oneHour + 32 * oneMinute),
      minutes: 32,
      pagesRead: [0, 1, 2, 3],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 2 * oneDay - 4 * oneHour + 6 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 2 * oneDay - 4 * oneHour + 13 * oneMinute) },
        { pageIndex: 2, at: new Date(now.getTime() - 2 * oneDay - 4 * oneHour + 21 * oneMinute) },
        { pageIndex: 3, at: new Date(now.getTime() - 2 * oneDay - 4 * oneHour + 28 * oneMinute) }
      ]
    },
    {
      childId: children.sophie._id,
      parentId: parent2Id,
      bookId: marsBook._id,
      startedAt: new Date(now.getTime() - oneHour - 30 * oneMinute),
      endedAt: new Date(now.getTime() - oneHour - 30 * oneMinute + 20 * oneMinute),
      minutes: 20,
      pagesRead: [0, 1],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - oneHour - 30 * oneMinute + 7 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - oneHour - 30 * oneMinute + 15 * oneMinute) }
      ]
    },

    // Jack's reading session (Parent 2) - only one session since inactive
    {
      childId: children.jack._id,
      parentId: parent2Id,
      bookId: elephantBook._id,
      startedAt: new Date(now.getTime() - 5 * oneDay - 3 * oneHour),
      endedAt: new Date(now.getTime() - 5 * oneDay - 3 * oneHour + 8 * oneMinute),
      minutes: 8,
      pagesRead: [0, 1],
      progressEvents: [
        { pageIndex: 0, at: new Date(now.getTime() - 5 * oneDay - 3 * oneHour + 3 * oneMinute) },
        { pageIndex: 1, at: new Date(now.getTime() - 5 * oneDay - 3 * oneHour + 6 * oneMinute) }
      ]
    }
  ];

  await ReadingSessionModel.insertMany(sessions);
  console.log(`✅ Created ${sessions.length} reading sessions`);
};

const seed = async (): Promise<void> => {
  console.log("\n🌱 Starting seed process...\n");
  await connectDatabase();
  await clearExistingData();

  const { admin, parent1, parent2 } = await seedUsers();
  const ageGroups = await seedAgeGroups();
  const categories = await seedCategories();
  const books = await seedBooks(admin._id, ageGroups, categories);
  const children = await seedChildrenAndPolicies(parent1._id, parent2._id, ageGroups, categories);
  await seedReadingSessions(parent1._id, parent2._id, children, books);

  console.log("\n✅ Seed completed successfully!\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("📧 Admin login: admin@hkids.com / Admin123");
  console.log("📧 Parent 1 login: sarah@hkids.com / Parent123");
  console.log("📧 Parent 2 login: michael@hkids.com / Parent456");
  console.log("═══════════════════════════════════════════════════");
  console.log("🔢 Child PINs:");
  console.log("   Leo (age 7) = 1234");
  console.log("   Mia (age 4) = 2468");
  console.log("   Sophie (age 10) = 5678");
  console.log("   Jack (age 3, inactive) = 9999");
  console.log("═══════════════════════════════════════════════════");
  console.log(`📊 Database summary:`);
  console.log(`   Users: ${await UserModel.countDocuments()}`);
  console.log(`   Age Groups: ${await AgeGroupModel.countDocuments()}`);
  console.log(`   Categories: ${await CategoryModel.countDocuments()}`);
  console.log(`   Books: ${await BookModel.countDocuments()}`);
  console.log(`   Children: ${await ChildModel.countDocuments()}`);
  console.log(`   Policies: ${await ChildPolicyModel.countDocuments()}`);
  console.log(`   Reading Sessions: ${await ReadingSessionModel.countDocuments()}`);
  console.log("═══════════════════════════════════════════════════\n");
};

seed()
  .catch((error) => {
    console.error("\n❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
