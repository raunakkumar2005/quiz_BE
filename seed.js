// Seed script to add test questions to the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './src/models/Question.js';

dotenv.config();

// Sample test questions
const seedQuestions = [
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'EASY',
    question_text: 'What is the SI unit of force?',
    option_a: 'Newton',
    option_b: 'Joule',
    option_c: 'Watt',
    option_d: 'Pascal',
    correct_option: 'A',
    explanation: 'The Newton (N) is the SI unit of force. It is defined as the force required to accelerate a mass of 1 kg at 1 m/s².',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'EASY',
    question_text: 'What is the acceleration due to gravity on Earth?',
    option_a: '9.8 m/s²',
    option_b: '10 m/s²',
    option_c: '12 m/s²',
    option_d: '8.9 m/s²',
    correct_option: 'A',
    explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s².',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'MEDIUM',
    question_text: 'A body of mass 2 kg is moving with a velocity of 3 m/s. What is its kinetic energy?',
    option_a: '9 J',
    option_b: '6 J',
    option_c: '3 J',
    option_d: '12 J',
    correct_option: 'A',
    explanation: 'Kinetic energy = (1/2)mv² = (1/2) × 2 × 3² = 9 J',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'MEDIUM',
    question_text: 'What is the momentum of a 5 kg object moving at 2 m/s?',
    option_a: '10 kg·m/s',
    option_b: '7 kg·m/s',
    option_c: '3 kg·m/s',
    option_d: '25 kg·m/s',
    correct_option: 'A',
    explanation: 'Momentum = mass × velocity = 5 × 2 = 10 kg·m/s',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'HARD',
    question_text: 'A particle moves in a circle of radius R with constant speed v. What is the centripetal acceleration?',
    option_a: 'v²/R',
    option_b: 'vR',
    option_c: 'v/R',
    option_d: 'Rv²',
    correct_option: 'A',
    explanation: 'Centripetal acceleration = v²/R, directed towards the center of the circle.',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'HARD',
    question_text: 'Two masses m1 and m2 are connected by a string passing over a frictionless pulley. What is the acceleration of the system?',
    option_a: 'g(m1-m2)/(m1+m2)',
    option_b: 'g(m1+m2)/(m1-m2)',
    option_c: 'g',
    option_d: 'g/2',
    correct_option: 'A',
    explanation: 'For an Atwood machine, acceleration = g(m1-m2)/(m1+m2)',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Chemistry',
    topic: 'Organic',
    difficulty: 'EASY',
    question_text: 'What is the hybridisation of carbon in methane?',
    option_a: 'sp³',
    option_b: 'sp²',
    option_c: 'sp',
    option_d: 'sp³d',
    correct_option: 'A',
    explanation: 'Carbon in methane is sp³ hybridised with bond angle 109.5°.',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Chemistry',
    topic: 'Organic',
    difficulty: 'EASY',
    question_text: 'Which gas is evolved when sodium reacts with water?',
    option_a: 'Hydrogen',
    option_b: 'Oxygen',
    option_c: 'Nitrogen',
    option_d: 'Carbon dioxide',
    correct_option: 'A',
    explanation: 'Sodium reacts with water to produce sodium hydroxide and hydrogen gas.',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'EASY',
    question_text: 'What is the derivative of x²?',
    option_a: '2x',
    option_b: 'x',
    option_c: '2',
    option_d: 'x²',
    correct_option: 'A',
    explanation: 'd/dx(x²) = 2x using power rule.',
    source: 'PYQ'
  },
  {
    exam: 'JEE',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'MEDIUM',
    question_text: 'What is the integral of 2x dx?',
    option_a: 'x² + C',
    option_b: '2x² + C',
    option_c: 'x + C',
    option_d: '2 + C',
    correct_option: 'A',
    explanation: '∫2x dx = x² + C',
    source: 'PYQ'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert seed questions
    await Question.insertMany(seedQuestions);
    console.log(`Inserted ${seedQuestions.length} questions`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
