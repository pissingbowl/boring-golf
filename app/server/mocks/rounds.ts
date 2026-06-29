import type { CaddieRound, CaddieRoundPlayer, CourseData, CourseHole } from "@shared/domain";

const pinehurstHoles: CourseHole[] = [
  { number: 1, par: 4, yardage: 404, handicap: 9, notes: "Gentle dogleg left to open. Favor the right side off the tee to avoid the left fairway bunkers. The green is slightly elevated with runoffs on all sides." },
  { number: 2, par: 4, yardage: 488, handicap: 1, notes: "The longest and toughest par 4. Big hitters can cut the corner over the left bunker. The green is severely contoured — miss left and you're chipping back up a slope." },
  { number: 3, par: 4, yardage: 378, handicap: 13, notes: "Shorter par 4 with a tight landing area. The green is protected by deep bunkers on both sides. Precision over power here." },
  { number: 4, par: 4, yardage: 485, handicap: 3, notes: "Uphill all the way. The fairway bunkers on the left are in play for longer hitters. The green slopes back to front — leave it below the hole." },
  { number: 5, par: 4, yardage: 475, handicap: 5, notes: "A classic risk-reward hole. The aggressive line over the left bunkers shortens the hole but brings the native area into play." },
  { number: 6, par: 3, yardage: 212, handicap: 15, notes: "Long par 3 with a wide but shallow green. Club selection is critical — the front bunker is deep and the back falls off into trouble." },
  { number: 7, par: 4, yardage: 438, handicap: 7, notes: "Favor the left side off the tee. The right fairway bunker is a round-killer — if you're in there, you're laying up. Approach plays longer than it looks due to the elevated green. Club up." },
  { number: 8, par: 4, yardage: 466, handicap: 11, notes: "Slight dogleg right. The fairway narrows at the landing area. The green is one of the most severe on the course — aim for the center and let the ball feed." },
  { number: 9, par: 3, yardage: 194, handicap: 17, notes: "Downhill par 3 to a crowned green. The ball will not hold from long. Short and right is the bail-out. Don't be long." },
  { number: 10, par: 5, yardage: 610, handicap: 2, notes: "The longest hole on the course. A good drive leaves a layup to your favorite yardage. The green is wide but the front right bunker is brutal." },
  { number: 11, par: 4, yardage: 478, handicap: 4, notes: "Demanding driving hole. The fairway tilts left to right, feeding balls toward the trees. The approach is semi-blind to an elevated green." },
  { number: 12, par: 4, yardage: 449, handicap: 8, notes: "Straightaway par 4 with a false front on the green. Take one more club than you think — balls landing short will roll back 30 yards." },
  { number: 13, par: 4, yardage: 377, handicap: 14, notes: "Short but deceptive. The green is tucked behind a ridge. Miss right and you're in the native area. Miss left and you're chipping from a tight lie." },
  { number: 14, par: 4, yardage: 478, handicap: 6, notes: "Long par 4 that plays into the prevailing wind. The green is angled right to left. A draw is the play off the tee." },
  { number: 15, par: 3, yardage: 206, handicap: 16, notes: "The signature par 3. The turtle-back green sheds balls in all directions. The center of the green is the only safe target. Pray after you hit." },
  { number: 16, par: 4, yardage: 531, handicap: 10, notes: "Par 4 that plays as a 5 for most. Don't get cute — the safe play is to favor the left side and leave a manageable approach." },
  { number: 17, par: 3, yardage: 197, handicap: 18, notes: "The last par 3. The green slopes dramatically front to back. Back pin locations are treacherous — aim 10 feet short and let it release." },
  { number: 18, par: 4, yardage: 447, handicap: 12, notes: "Finish strong. The fairway bunkers on the right guard the optimal line. The green is open in front — run it up if the conditions allow." },
];

export const pinehurstCourse: CourseData = {
  id: "course-pinehurst-2",
  name: "Pinehurst No. 2",
  location: "Pinehurst, North Carolina",
  holes: pinehurstHoles,
};

const mockPlayers: CaddieRoundPlayer[] = [
  {
    playerId: "member-001",
    playerName: "Jake Morrison",
    avatarInitials: "JM",
    holeScores: [4, 5, 4, 5, 4, 3, null, null, null, null, null, null, null, null, null, null, null, null],
    runningTotal: 1,
  },
  {
    playerId: "member-002",
    playerName: "Ryan Chen",
    avatarInitials: "RC",
    holeScores: [5, 4, 3, 5, 5, 4, null, null, null, null, null, null, null, null, null, null, null, null],
    runningTotal: 2,
  },
  {
    playerId: "member-003",
    playerName: "Marcus Williams",
    avatarInitials: "MW",
    holeScores: [4, 4, 4, 4, 4, 3, null, null, null, null, null, null, null, null, null, null, null, null],
    runningTotal: -1,
  },
  {
    playerId: "member-004",
    playerName: "Chris O'Brien",
    avatarInitials: "CO",
    holeScores: [5, 5, 5, 6, 5, 4, null, null, null, null, null, null, null, null, null, null, null, null],
    runningTotal: 6,
  },
];

export let activeRound: CaddieRound | null = {
  id: "round-001",
  tripId: "trip-001",
  gameId: "game-001",
  courseId: "course-pinehurst-2",
  courseName: "Pinehurst No. 2",
  status: "in_progress",
  currentHole: 7,
  players: mockPlayers,
  startedAt: new Date(),
};

export function getActiveRound(tripId: string): CaddieRound | null {
  if (activeRound && activeRound.tripId === tripId && activeRound.status === "in_progress") {
    return activeRound;
  }
  return null;
}

export function getCourseData(courseId: string): CourseData | null {
  if (courseId === pinehurstCourse.id) {
    return pinehurstCourse;
  }
  return null;
}

export function updatePlayerScore(roundId: string, playerId: string, holeIndex: number, score: number): boolean {
  if (!activeRound || activeRound.id !== roundId) return false;
  
  const player = activeRound.players.find(p => p.playerId === playerId);
  if (!player) return false;
  
  const oldScore = player.holeScores[holeIndex];
  player.holeScores[holeIndex] = score;
  
  const par = pinehurstHoles[holeIndex]?.par || 4;
  if (oldScore !== null) {
    player.runningTotal -= (oldScore - par);
  }
  player.runningTotal += (score - par);
  
  return true;
}

export function advanceRound(roundId: string, direction: 'next' | 'prev'): boolean {
  if (!activeRound || activeRound.id !== roundId) return false;
  
  if (direction === 'next' && activeRound.currentHole < 18) {
    activeRound.currentHole += 1;
    return true;
  }
  if (direction === 'prev' && activeRound.currentHole > 1) {
    activeRound.currentHole -= 1;
    return true;
  }
  return false;
}

export function goToHole(roundId: string, holeNumber: number): boolean {
  if (!activeRound || activeRound.id !== roundId) return false;
  if (holeNumber < 1 || holeNumber > 18) return false;
  
  activeRound.currentHole = holeNumber;
  return true;
}

export function endRound(roundId: string): boolean {
  if (!activeRound || activeRound.id !== roundId) return false;
  
  activeRound.status = "complete";
  activeRound.completedAt = new Date();
  return true;
}
