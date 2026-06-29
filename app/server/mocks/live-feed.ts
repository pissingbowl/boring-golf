import type { 
  LiveCardPgaTour, 
  LiveCardTourSchedule, 
  LiveCardGolfNews, 
  LiveCardHistory, 
  LiveCardCourseSpotlight 
} from "@shared/domain";

export const mockPgaTourCards: Omit<LiveCardPgaTour, 'id'>[] = [
  {
    type: 'pga-tour',
    tournamentName: "The Sentry",
    location: "Kapalua, Maui, HI",
    currentLeader: "Scottie Scheffler",
    leaderScore: "-18",
    roundStatus: "Round 3 underway",
    leaderboardUrl: "https://www.pgatour.com/leaderboard"
  },
  {
    type: 'pga-tour',
    tournamentName: "Sony Open in Hawaii",
    location: "Honolulu, HI",
    currentLeader: "Hideki Matsuyama",
    leaderScore: "-21",
    roundStatus: "Final round",
    leaderboardUrl: "https://www.pgatour.com/leaderboard"
  },
  {
    type: 'pga-tour',
    tournamentName: "The American Express",
    location: "La Quinta, CA",
    currentLeader: "Jon Rahm",
    leaderScore: "-16",
    roundStatus: "Round 2 complete",
    leaderboardUrl: "https://www.pgatour.com/leaderboard"
  }
];

export const mockTourScheduleCards: Omit<LiveCardTourSchedule, 'id'>[] = [
  {
    type: 'tour-schedule',
    tournamentName: "Farmers Insurance Open",
    dates: "Jan 22-25, 2025",
    location: "San Diego, CA",
    courseName: "Torrey Pines Golf Course"
  },
  {
    type: 'tour-schedule',
    tournamentName: "AT&T Pebble Beach Pro-Am",
    dates: "Jan 30 - Feb 2, 2025",
    location: "Pebble Beach, CA",
    courseName: "Pebble Beach Golf Links"
  },
  {
    type: 'tour-schedule',
    tournamentName: "WM Phoenix Open",
    dates: "Feb 6-9, 2025",
    location: "Scottsdale, AZ",
    courseName: "TPC Scottsdale"
  },
  {
    type: 'tour-schedule',
    tournamentName: "The Genesis Invitational",
    dates: "Feb 13-16, 2025",
    location: "Pacific Palisades, CA",
    courseName: "Riviera Country Club"
  }
];

export const mockGolfNewsCards: Omit<LiveCardGolfNews, 'id'>[] = [
  {
    type: 'golf-news',
    headline: "Tiger Woods announces return to competitive golf at Genesis Invitational",
    source: "Golf Digest",
    timeAgo: "2 hours ago"
  },
  {
    type: 'golf-news',
    headline: "Rory McIlroy leads call for unified professional golf tour",
    source: "ESPN Golf",
    timeAgo: "4 hours ago"
  },
  {
    type: 'golf-news',
    headline: "USGA announces new local rules for 2025 season",
    source: "Golf Week",
    timeAgo: "6 hours ago"
  },
  {
    type: 'golf-news',
    headline: "Augusta National makes subtle changes to Amen Corner ahead of Masters",
    source: "The Athletic",
    timeAgo: "1 day ago"
  },
  {
    type: 'golf-news',
    headline: "Jordan Spieth signs multi-year equipment deal with Titleist",
    source: "Golf.com",
    timeAgo: "2 days ago"
  }
];

export const mockHistoryCards: Omit<LiveCardHistory, 'id'>[] = [
  {
    type: 'history',
    year: 1997,
    description: "Tiger Woods won his first Masters by a record 12 strokes, shooting 18-under par at age 21.",
    playerName: "Tiger Woods"
  },
  {
    type: 'history',
    year: 1930,
    description: "Bobby Jones completed the Grand Slam, winning all four major championships in a single year.",
    playerName: "Bobby Jones"
  },
  {
    type: 'history',
    year: 1986,
    description: "Jack Nicklaus won his 18th and final major at age 46, charging from behind at the Masters.",
    playerName: "Jack Nicklaus"
  },
  {
    type: 'history',
    year: 2000,
    description: "Tiger Woods won the U.S. Open at Pebble Beach by a record 15 strokes.",
    playerName: "Tiger Woods"
  },
  {
    type: 'history',
    year: 1953,
    description: "Ben Hogan won three majors in one year: the Masters, U.S. Open, and Open Championship.",
    playerName: "Ben Hogan"
  },
  {
    type: 'history',
    year: 2019,
    description: "Tiger Woods completed one of sport's greatest comebacks, winning the Masters 14 years after his last major.",
    playerName: "Tiger Woods"
  },
  {
    type: 'history',
    year: 1960,
    description: "Arnold Palmer charged from seven strokes back to win the U.S. Open at Cherry Hills.",
    playerName: "Arnold Palmer"
  }
];

export const mockCourseSpotlightCards: Omit<LiveCardCourseSpotlight, 'id'>[] = [
  {
    type: 'course-spotlight',
    courseName: "Augusta National Golf Club",
    location: "Augusta, Georgia",
    par: 72,
    yardage: 7545,
    designer: "Alister MacKenzie & Bobby Jones",
    yearBuilt: 1933,
    funFact: "The course was built on the site of a former indigo plantation and nursery, which is why each hole is named after a plant."
  },
  {
    type: 'course-spotlight',
    courseName: "Pebble Beach Golf Links",
    location: "Pebble Beach, California",
    par: 72,
    yardage: 7075,
    designer: "Jack Neville & Douglas Grant",
    yearBuilt: 1919,
    funFact: "The iconic 7th hole is the shortest par 3 on the PGA Tour at just 106 yards, but has produced more double bogeys than any other hole."
  },
  {
    type: 'course-spotlight',
    courseName: "St Andrews Old Course",
    location: "St Andrews, Scotland",
    par: 72,
    yardage: 7305,
    designer: "Nature (evolved over 600 years)",
    yearBuilt: 1400,
    funFact: "It's the oldest golf course in the world. The famous Road Hole bunker on 17 has been nicknamed 'the most feared bunker in golf.'"
  },
  {
    type: 'course-spotlight',
    courseName: "Pinehurst No. 2",
    location: "Pinehurst, North Carolina",
    par: 72,
    yardage: 7588,
    designer: "Donald Ross",
    yearBuilt: 1907,
    funFact: "Donald Ross lived on the property for nearly 50 years and continually refined the course until his death in 1948."
  },
  {
    type: 'course-spotlight',
    courseName: "Cypress Point Club",
    location: "Pebble Beach, California",
    par: 72,
    yardage: 6536,
    designer: "Alister MacKenzie",
    yearBuilt: 1928,
    funFact: "The 16th hole requires a 220-yard carry over the Pacific Ocean and has been called the greatest par 3 in golf."
  },
  {
    type: 'course-spotlight',
    courseName: "Royal Melbourne (West)",
    location: "Melbourne, Australia",
    par: 72,
    yardage: 6650,
    designer: "Alister MacKenzie",
    yearBuilt: 1931,
    funFact: "The famous sand belt bunkers are so deep they require ladders for spectators to see inside during tournaments."
  }
];

export function getRandomLiveFeedCard(): { type: string; data: unknown } {
  const categories = ['pga-tour', 'tour-schedule', 'golf-news', 'history', 'course-spotlight'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  switch (category) {
    case 'pga-tour':
      return { type: 'pga-tour', data: mockPgaTourCards[Math.floor(Math.random() * mockPgaTourCards.length)] };
    case 'tour-schedule':
      return { type: 'tour-schedule', data: mockTourScheduleCards[Math.floor(Math.random() * mockTourScheduleCards.length)] };
    case 'golf-news':
      return { type: 'golf-news', data: mockGolfNewsCards[Math.floor(Math.random() * mockGolfNewsCards.length)] };
    case 'history':
      return { type: 'history', data: mockHistoryCards[Math.floor(Math.random() * mockHistoryCards.length)] };
    case 'course-spotlight':
      return { type: 'course-spotlight', data: mockCourseSpotlightCards[Math.floor(Math.random() * mockCourseSpotlightCards.length)] };
    default:
      return { type: 'pga-tour', data: mockPgaTourCards[0] };
  }
}
