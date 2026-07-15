import { Participant, Venue, Agenda, Vote } from '../types.ts';
import { MOCK_RESTAURANTS, MOCK_ACTIVITIES } from '../constants.ts';

export function generateAgendas(participants: Participant[], planRadius: number): Agenda[] {
  // 1. Aggregate Constraints
  const minBudget = Math.min(...participants.map(p => p.budgetMax));
  const minDistance = Math.min(planRadius, ...participants.map(p => p.maxDistance || planRadius));
  const allDietary = new Set(participants.flatMap(p => p.dietaryRestrictions));
  const allBoundaries = new Set(participants.flatMap(p => p.hardBoundaries));

  // 2. Filter Restaurants
  const eligibleRestaurants = MOCK_RESTAURANTS.filter(r => {
    if (r.distanceMiles > minDistance) return false;
    if (r.violatesBoundaries.some(b => allBoundaries.has(b))) return false;
    
    // Simple dietary check: if group needs Vegan, restaurant must have Vegan or Veg-Friendly
    if (allDietary.has('Vegan') && !r.categories.includes('Vegan')) return false;
    if (allDietary.has('Vegetarian') && !r.categories.includes('Vegetarian-Friendly') && !r.categories.includes('Vegan')) return false;
    
    return true;
  });

  // 3. Filter Activities
  const eligibleActivities = MOCK_ACTIVITIES.filter(a => {
    if (a.distanceMiles > minDistance) return false;
    if (a.violatesBoundaries.some(b => allBoundaries.has(b))) return false;
    return true;
  });

  // 4. Create Combinations & Score
  let possibleAgendas: Agenda[] = [];
  let idCounter = 1;

  for (const r of eligibleRestaurants) {
    for (const a of eligibleActivities) {
      const totalCost = r.costPerPerson + a.costPerPerson;
      
      // Hard budget constraint
      if (totalCost > minBudget) continue;

      // Calculate Score based on preferences
      let score = 0;
      participants.forEach(p => {
        if (r.categories.some(c => p.likedCuisines.includes(c))) score += 2;
        if (a.categories.some(c => p.activityInterests.includes(c))) score += 2;
      });

      // Distance penalty
      const totalDistance = r.distanceMiles + a.distanceMiles;
      score -= (totalDistance * 0.1);

      possibleAgendas.push({
        id: `agenda-${idCounter++}`,
        restaurant: r,
        activity: a,
        totalCostEstimate: totalCost,
        totalDistance,
        score,
        whyItFits: "Calculating..." // Will be filled by Gemini or default
      });
    }
  }

  // 5. Sort and take top 3
  possibleAgendas.sort((a, b) => b.score - a.score);
  return possibleAgendas.slice(0, 3);
}

export function calculateWinner(votes: Vote[], agendas: Agenda[]): string | null {
  if (votes.length === 0 || agendas.length === 0) return null;

  // Simple Borda Count for MVP
  const scores: Record<string, number> = {};
  agendas.forEach(a => scores[a.id] = 0);

  votes.forEach(v => {
    if (scores[v.firstChoiceId] !== undefined) scores[v.firstChoiceId] += 3;
    if (scores[v.secondChoiceId] !== undefined) scores[v.secondChoiceId] += 2;
    if (scores[v.thirdChoiceId] !== undefined) scores[v.thirdChoiceId] += 1;
  });

  let winnerId = agendas[0].id;
  let maxScore = -1;

  for (const [id, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winnerId = id;
    }
  }

  return winnerId;
}
