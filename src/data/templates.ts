import { DecisionInput } from '../types/decision';

export const DECISION_TEMPLATES: Array<DecisionInput & { tag: string; badge: string }> = [
  {
    title: 'Accept Early-Stage Startup Offer vs. Stay at Established Tech Giant',
    description: 'Received an offer for Head of Product at a 15-person Series A AI startup. Currently an L6 Senior PM at a large profitable tech firm with steady vesting equity.',
    options: [
      'Join Series A AI Startup (Head of Product, 1.2% equity, 15% salary reduction)',
      'Stay at Big Tech (High total comp, predictable hours, promotion cycle in 9 months)',
      'Negotiate Internal Transfer at Big Tech into New Emerging AI Group'
    ],
    userPriorities: 'I want career compounding and high agency, but I have a mortgage and value having weekends mostly free.',
    category: 'career',
    urgency: 'high',
    tag: 'Career & Agency',
    badge: 'Popular Dilemma'
  },
  {
    title: 'Buy a Suburban Family Home vs. Continue Renting and Investing in Index Funds',
    description: 'We have $180k saved. We can put 20% down on a 4-bedroom home with an interest rate of 6.2%, or keep renting our comfortable apartment and invest the surplus into low-cost index funds.',
    options: [
      'Buy Suburban Home ($750k purchase price, 30-year mortgage, property taxes, maintenance)',
      'Rent & Invest Surplus (Stay in city rental, invest down-payment and monthly delta into global index funds)'
    ],
    userPriorities: 'Need space for growing family over the next 5-8 years, but terrified of becoming house-poor or locked into one geographic location.',
    category: 'finance',
    urgency: 'medium',
    tag: 'Real Estate & Wealth',
    badge: 'Financial Milestone'
  },
  {
    title: 'Re-Architect Legacy Monolith to Microservices vs. Modularize In-Place',
    description: 'Our 7-year-old Node.js monolith is slowing down deployments and team onboarding. Management wants faster shipping velocity.',
    options: [
      'Gradual In-Place Modular Monolith (Establish domain boundaries, linting rules, shared DB)',
      'Full Microservices Migration (Decompose into event-driven services with Kubernetes)',
      'Extract Only Hotspots (Keep monolith, extract the billing and ingest engines to standalone serverless services)'
    ],
    userPriorities: 'We have an 8-person engineering team. We cannot afford a 6-month product feature freeze.',
    category: 'tech',
    urgency: 'medium',
    tag: 'Engineering Strategy',
    badge: 'Architecture'
  },
  {
    title: 'Relocate to New York City vs. Remain in Low Cost of Living Tech Hub',
    description: 'Remote tech worker in Austin, TX evaluating whether moving to NYC will boost social life, serendipity, and career network.',
    options: [
      'Relocate to NYC (Sign 1-year Brooklyn lease, immerse in culture, higher rent & taxes)',
      'Stay in Austin (Low tax, larger living space, established community, travel to NYC 4x/year)'
    ],
    userPriorities: 'Energy, dating scene, cultural stimulation vs. financial savings rate and personal physical space.',
    category: 'lifestyle',
    urgency: 'low',
    tag: 'Life & Location',
    badge: 'Life Crossroads'
  }
];
