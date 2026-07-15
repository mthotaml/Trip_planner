import React, { useState, useEffect, useCallback } from 'react';
import { PlanStatus, AppState, OutingType, Participant, PlanDetails, Vote } from './types.ts';
import { extractPlanDetails, generateWhyItFits } from './services/gemini.ts';
import { generateAgendas, calculateWinner } from './services/engine.ts';
import { Button, Card, Input, Select, Badge } from './components/ui.tsx';
import { AVAILABLE_CUISINES, AVAILABLE_ACTIVITIES, AVAILABLE_BOUNDARIES, DIETARY_OPTIONS } from './constants.ts';
import { TEST_SCENARIOS } from './testData.ts';
import { MapPin, Clock, Users, Sparkles, CheckCircle2, AlertCircle, Beaker, Check, ShieldCheck, Car } from 'lucide-react';

const INITIAL_STATE: AppState = {
  status: PlanStatus.DRAFT,
  details: null,
  participants: [],
  agendas: [],
  votes: [],
  winningAgendaId: null,
  error: null,
  assemblyPoint: '',
  assemblyTime: '',
  designatedDriverId: '',
  homeSafeCheckIns: []
};

const STEPS = [
  { id: PlanStatus.DRAFT, label: 'Details' },
  { id: PlanStatus.COLLECTING_PREFS, label: 'Group Preference' },
  { id: PlanStatus.VOTING, label: 'Vote' },
  { id: PlanStatus.CONFIRMED, label: 'Winner' },
  { id: PlanStatus.COORDINATING, label: 'Coordinate' },
  { id: PlanStatus.HOME_SAFE, label: 'Home Safe' },
];

const getStepIndex = (status: PlanStatus) => {
  if (status === PlanStatus.GENERATING) return 2; // Map generating to voting step visually
  const idx = STEPS.findIndex(s => s.id === status);
  return idx >= 0 ? idx : 0;
};

interface ScreenProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  setError: (error: string) => void;
}

// --- Screen: Create Plan (AI Input) ---
const ScreenCreatePlan: React.FC<ScreenProps> = ({ state, updateState, setError }) => {
  const [prompt, setPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [formData, setFormData] = useState<Partial<PlanDetails>>(
    state.details || {
      name: '', type: OutingType.FRIENDS, date: '', location: '', expectedSize: 4, preferredRadiusMiles: 20
    }
  );

  const handleAIParse = async () => {
    if (!prompt) return;
    setIsExtracting(true);
    try {
      const extracted = await extractPlanDetails(prompt);
      setFormData(prev => ({ ...prev, ...extracted }));
      setManualMode(true); // Show form to confirm
    } catch (e: any) {
      setError(e.message);
      setManualMode(true); // Fallback to manual
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location) {
      setError("Name and Location are required.");
      return;
    }
    updateState({
      details: formData as PlanDetails,
      status: PlanStatus.COLLECTING_PREFS
    });
  };

  const loadTestScenario = (scenario: typeof TEST_SCENARIOS[0]) => {
    updateState({
      details: scenario.details,
      participants: scenario.participants,
      status: PlanStatus.COLLECTING_PREFS,
      votes: [],
      winningAgendaId: null,
      agendas: [],
      homeSafeCheckIns: []
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Plan Your Night Out</h1>
        <p className="text-lg text-gray-600">Let AI handle the logistics so you can focus on the fun.</p>
      </div>

      <Card>
        {!manualMode ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your ideal night out in plain English:
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4 h-32"
              placeholder="e.g., Six of us want to go out Saturday around Irvine. We want dinner and something fun afterward. Keep it under $100 each..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={handleAIParse} disabled={isExtracting || !prompt} className="w-full flex justify-center items-center gap-2">
              {isExtracting ? 'Analyzing...' : <><Sparkles size={18} /> Generate Plan Details</>}
            </Button>
            <div className="mt-4 text-center">
              <button onClick={() => setManualMode(true)} className="text-sm text-indigo-600 hover:underline">
                Or enter details manually
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirm Plan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Plan Name" value={formData.name || ''} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
              <Select 
                label="Outing Type" 
                value={formData.type} 
                onChange={(e: any) => setFormData({...formData, type: e.target.value as OutingType})}
                options={[
                  {label: 'Friends Night Out', value: OutingType.FRIENDS},
                  {label: 'Couple / Date Night', value: OutingType.COUPLE},
                  {label: 'Couples Group', value: OutingType.COUPLES_GROUP},
                ]}
              />
              <Input label="Date" type="date" value={formData.date || ''} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
              <Input label="Location" value={formData.location || ''} onChange={(e: any) => setFormData({...formData, location: e.target.value})} />
              <Input label="Group Size" type="number" value={formData.expectedSize || ''} onChange={(e: any) => setFormData({...formData, expectedSize: parseInt(e.target.value)})} />
              <Input label="Travel Radius (miles)" type="number" value={formData.preferredRadiusMiles || ''} onChange={(e: any) => setFormData({...formData, preferredRadiusMiles: parseInt(e.target.value)})} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setManualMode(false)}>Back</Button>
              <Button onClick={handleSubmit}>Next: Add Participants</Button>
            </div>
          </div>
        )}

        {/* Developer Quick Load Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
            <Beaker size={16} />
            <span>Developer Quick Load</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEST_SCENARIOS.map((scenario, idx) => (
              <Button 
                key={idx} 
                variant="secondary" 
                className="text-xs py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                onClick={() => loadTestScenario(scenario)}
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Screen: Collect Preferences ---
const ScreenParticipants: React.FC<ScreenProps> = ({ state, updateState, setError }) => {
  const [currentParticipant, setCurrentParticipant] = useState<Partial<Participant>>({
    name: '', budgetMax: 100, maxDistance: state.details?.preferredRadiusMiles || 20, dietaryRestrictions: [], likedCuisines: [], activityInterests: [], hardBoundaries: []
  });

  const handleAdd = () => {
    if (!currentParticipant.name) return;
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name: currentParticipant.name,
      budgetMax: currentParticipant.budgetMax || 100,
      maxDistance: currentParticipant.maxDistance || 20,
      dietaryRestrictions: currentParticipant.dietaryRestrictions || [],
      likedCuisines: currentParticipant.likedCuisines || [],
      activityInterests: currentParticipant.activityInterests || [],
      hardBoundaries: currentParticipant.hardBoundaries || []
    };
    updateState({ participants: [...state.participants, newParticipant] });
    setCurrentParticipant({ name: '', budgetMax: 100, maxDistance: state.details?.preferredRadiusMiles || 20, dietaryRestrictions: [], likedCuisines: [], activityInterests: [], hardBoundaries: [] });
  };

  const toggleArrayItem = (field: keyof Participant, item: string) => {
    setCurrentParticipant(prev => {
      const arr = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
      };
    });
  };

  const handleGenerate = () => {
    if (state.participants.length < 2) {
      setError("Need at least 2 participants to generate a group plan.");
      return;
    }
    updateState({ 
      status: PlanStatus.GENERATING,
      votes: [], // Clear previous votes if re-generating
      winningAgendaId: null,
      agendas: []
    });
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Add Participant Preferences</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Name" value={currentParticipant.name} onChange={(e: any) => setCurrentParticipant({...currentParticipant, name: e.target.value})} />
              <Input label="Max Budget ($)" type="number" value={currentParticipant.budgetMax} onChange={(e: any) => setCurrentParticipant({...currentParticipant, budgetMax: parseInt(e.target.value)})} />
              <Input label="Max Distance (mi)" type="number" value={currentParticipant.maxDistance} onChange={(e: any) => setCurrentParticipant({...currentParticipant, maxDistance: parseInt(e.target.value)})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => toggleArrayItem('dietaryRestrictions', opt)}
                    className={`px-3 py-1 rounded-full text-sm border ${currentParticipant.dietaryRestrictions?.includes(opt) ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Liked Cuisines</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CUISINES.map(opt => (
                  <button key={opt} onClick={() => toggleArrayItem('likedCuisines', opt)}
                    className={`px-3 py-1 rounded-full text-sm border ${currentParticipant.likedCuisines?.includes(opt) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Interests</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ACTIVITIES.map(opt => (
                  <button key={opt} onClick={() => toggleArrayItem('activityInterests', opt)}
                    className={`px-3 py-1 rounded-full text-sm border ${currentParticipant.activityInterests?.includes(opt) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hard Boundaries (Dealbreakers)</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BOUNDARIES.map(opt => (
                  <button key={opt} onClick={() => toggleArrayItem('hardBoundaries', opt)}
                    className={`px-3 py-1 rounded-full text-sm border ${currentParticipant.hardBoundaries?.includes(opt) ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                    {opt.replace('no_', 'No ')}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAdd} className="w-full mt-4">Add Participant</Button>
          </div>
        </Card>
      </div>

      <div>
        <Card className="h-full">
          <h3 className="font-semibold mb-4 flex items-center justify-between">
            <span>Group ({state.participants.length}/{state.details?.expectedSize})</span>
          </h3>
          {state.participants.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No participants added yet.</p>
          ) : (
            <ul className="space-y-3 mb-6">
              {state.participants.map(p => (
                <li key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Budget: ${p.budgetMax} | Dist: {p.maxDistance}mi | {p.dietaryRestrictions.length > 0 ? p.dietaryRestrictions.join(', ') : 'No restrictions'}
                    </div>
                  </div>
                  <button 
                    onClick={() => updateState({ participants: state.participants.filter(x => x.id !== p.id) })}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          
          <Button 
            onClick={handleGenerate} 
            disabled={state.participants.length < 2}
            className="w-full"
          >
            Generate Agendas
          </Button>
        </Card>
      </div>
    </div>
  );
};

// --- Screen: Voting ---
const ScreenVoting: React.FC<ScreenProps> = ({ state, updateState, setError }) => {
  // Find the first participant who hasn't voted yet
  const initialVoterId = state.participants.find(p => !state.votes.some(v => v.participantId === p.id))?.id || state.participants[0]?.id || '';
  
  const [currentVoterId, setCurrentVoterId] = useState<string>(initialVoterId);
  const [rankings, setRankings] = useState<Record<string, string>>({ '1': '', '2': '', '3': '' });

  const handleVoteSubmit = () => {
    if (!rankings['1']) {
      setError("Please select at least a 1st choice.");
      return;
    }
    
    const newVote: Vote = {
      participantId: currentVoterId,
      firstChoiceId: rankings['1'],
      secondChoiceId: rankings['2'] || '',
      thirdChoiceId: rankings['3'] || ''
    };

    const updatedVotes = [...state.votes.filter(v => v.participantId !== currentVoterId), newVote];
    
    if (updatedVotes.length === state.participants.length) {
      // All voted!
      const winner = calculateWinner(updatedVotes, state.agendas);
      updateState({ votes: updatedVotes, winningAgendaId: winner, status: PlanStatus.CONFIRMED });
    } else {
      // Next voter
      const nextVoter = state.participants.find(p => !updatedVotes.some(v => v.participantId === p.id));
      if (nextVoter) {
        setCurrentVoterId(nextVoter.id);
        setRankings({ '1': '', '2': '', '3': '' });
      }
      updateState({ votes: updatedVotes });
    }
  };

  const currentVoter = state.participants.find(p => p.id === currentVoterId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Vote on Agendas</h2>
        <p className="text-gray-600 mt-2">Review the 3 options and rank your favorites.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {state.agendas.map((agenda, idx) => (
          <Card key={agenda.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge color="indigo">Option {idx + 1}</Badge>
              <span className="text-sm font-bold text-green-600">${agenda.totalCostEstimate} est.</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-lg">{agenda.restaurant.name}</h4>
                <p className="text-sm text-gray-500">{agenda.restaurant.categories.join(', ')}</p>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                <div className="h-8 border-l-2 border-dashed border-gray-300"></div>
              </div>
              <div>
                <h4 className="font-bold text-lg">{agenda.activity.name}</h4>
                <p className="text-sm text-gray-500">{agenda.activity.categories.join(', ')}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 italic">"{agenda.whyItFits}"</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={14}/> {agenda.totalDistance} mi total</span>
                <span className="flex items-center gap-1"><Users size={14}/> {agenda.score} match score</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="max-w-md mx-auto bg-indigo-50 border-indigo-100">
        <h3 className="font-bold text-lg mb-4 text-indigo-900">
          {currentVoter?.name}'s Turn to Vote
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(rank => (
            <div key={rank} className="flex items-center gap-3">
              <span className="font-bold text-indigo-400 w-6">{rank}.</span>
              <select 
                className="flex-1 p-2 rounded border border-indigo-200 focus:ring-indigo-500"
                value={rankings[rank.toString()]}
                onChange={(e) => setRankings({...rankings, [rank.toString()]: e.target.value})}
              >
                <option value="">Select Option...</option>
                {state.agendas.map((a, i) => (
                  <option key={a.id} value={a.id} disabled={Object.values(rankings).includes(a.id) && rankings[rank.toString()] !== a.id}>
                    Option {i + 1}: {a.restaurant.name} & {a.activity.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <Button onClick={handleVoteSubmit} className="w-full mt-6">Submit Vote</Button>
        <div className="text-center mt-3 text-sm text-indigo-600">
          Votes cast: {state.votes.length} / {state.participants.length}
        </div>
      </Card>
    </div>
  );
};

// --- Screen: Confirmed Winner ---
const ScreenConfirmed: React.FC<Omit<ScreenProps, 'setError'>> = ({ state, updateState }) => {
  const winner = state.agendas.find(a => a.id === state.winningAgendaId);
  if (!winner) return null;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-4xl font-bold text-gray-900">We have a winner!</h2>
        <p className="text-lg text-gray-600 mt-2">The group has spoken. Here is your final agenda.</p>
      </div>

      <Card className="text-left border-2 border-green-500 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg font-bold text-sm">
          Confirmed Plan
        </div>
        
        <h3 className="text-2xl font-bold mb-6">{state.details?.name}</h3>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-16 text-right font-bold text-gray-500 pt-1">Dinner</div>
            <div className="flex-1 border-l-2 border-gray-200 pl-4 pb-6">
              <h4 className="text-xl font-bold">{winner.restaurant.name}</h4>
              <p className="text-gray-600">{winner.restaurant.address}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{winner.restaurant.categories[0]}</Badge>
                <Badge color="green">~${winner.restaurant.costPerPerson}</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-16 text-right font-bold text-gray-500 pt-1">Activity</div>
            <div className="flex-1 border-l-2 border-gray-200 pl-4">
              <h4 className="text-xl font-bold">{winner.activity.name}</h4>
              <p className="text-gray-600">{winner.activity.address}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{winner.activity.categories[0]}</Badge>
                <Badge color="green">~${winner.activity.costPerPerson}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Estimated Cost</p>
              <p className="text-2xl font-bold text-gray-900">${winner.totalCostEstimate} <span className="text-sm font-normal text-gray-500">/ person</span></p>
            </div>
            <Button onClick={() => updateState({ status: PlanStatus.COORDINATING })}>
              Coordinate Logistics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Screen: Coordination (P1 MVP) ---
const ScreenCoordination: React.FC<Omit<ScreenProps, 'setError'>> = ({ state, updateState }) => {
  const [assembly, setAssembly] = useState(state.assemblyPoint || '');
  const [assemblyTime, setAssemblyTime] = useState(state.assemblyTime || '');
  const [driverId, setDriverId] = useState(state.designatedDriverId || '');
  const [checkedIn, setCheckedIn] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCheckIn = (id: string) => {
    setCheckedIn(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSaveLogistics = () => {
    updateState({ 
      assemblyPoint: assembly,
      assemblyTime: assemblyTime,
      designatedDriverId: driverId
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Coordination Hub</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20}/> Logistics & Assembly</h3>
          <div className="space-y-4">
            <Input 
              label="Where is everyone meeting?" 
              placeholder="e.g., John's house"
              value={assembly}
              onChange={(e: any) => setAssembly(e.target.value)}
            />
            <Input 
              label="Meeting Time" 
              type="time"
              value={assemblyTime}
              onChange={(e: any) => setAssemblyTime(e.target.value)}
            />
            <Select 
              label="Designated Driver" 
              value={driverId} 
              onChange={(e: any) => setDriverId(e.target.value)}
              options={[
                { label: 'None / Rideshare', value: '' },
                ...state.participants.map(p => ({ label: p.name, value: p.id }))
              ]}
            />
            <Button 
              variant={isSaved ? "primary" : "secondary"} 
              className={`w-full mt-2 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              onClick={handleSaveLogistics}
            >
              {isSaved ? 'Saved!' : 'Save Logistics'}
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20}/> Pre-Start Check-in</h3>
          <div className="space-y-2">
            {state.participants.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="flex items-center gap-2">
                  {p.name}
                  {p.id === state.designatedDriverId && <Car size={16} className="text-indigo-500" title="Designated Driver" />}
                </span>
                <button 
                  onClick={() => toggleCheckIn(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${checkedIn.includes(p.id) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {checkedIn.includes(p.id) ? 'Arrived' : 'Not Here'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" onClick={() => alert("Share link copied to clipboard!")}>
          Copy Shareable Link
        </Button>
        <Button onClick={() => updateState({ status: PlanStatus.HOME_SAFE })}>
          End Night & Check Home Safe
        </Button>
      </div>
    </div>
  );
};

// --- Screen: Home Safe ---
const ScreenHomeSafe: React.FC<Omit<ScreenProps, 'setError'>> = ({ state, updateState }) => {
  const toggleHomeSafe = (id: string) => {
    const current = state.homeSafeCheckIns || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    updateState({ homeSafeCheckIns: updated });
  };

  const allSafe = state.participants.length > 0 && (state.homeSafeCheckIns?.length === state.participants.length);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold">Home Safe Check</h2>
        <p className="text-gray-600 mt-2">Make sure everyone made it back safely to close out the night.</p>
      </div>

      <Card>
        <div className="space-y-3">
          {state.participants.map(p => {
            const isSafe = state.homeSafeCheckIns?.includes(p.id);
            return (
              <div key={p.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${isSafe ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <span className={`font-medium ${isSafe ? 'text-green-800' : 'text-gray-800'}`}>{p.name}</span>
                <Button
                  variant={isSafe ? "primary" : "outline"}
                  className={isSafe ? "bg-green-600 hover:bg-green-700 border-green-600" : ""}
                  onClick={() => toggleHomeSafe(p.id)}
                >
                  {isSafe ? "Safe at Home" : "Mark as Safe"}
                </Button>
              </div>
            );
          })}
        </div>

        {allSafe && (
          <div className="mt-8 p-6 bg-green-100 border border-green-300 rounded-xl text-center text-green-800 animate-pulse">
            <CheckCircle2 className="mx-auto mb-3 text-green-600" size={48} />
            <h3 className="font-bold text-2xl mb-1">Everyone is home safe!</h3>
            <p className="text-green-700">The night out is officially complete. See you next time!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const currentStepIndex = getStepIndex(state.status);

  // --- Screen: Generating (Effect) ---
  useEffect(() => {
    if (state.status === PlanStatus.GENERATING) {
      const runEngine = async () => {
        try {
          // 1. Deterministic generation
          const generated = generateAgendas(state.participants, state.details?.preferredRadiusMiles || 20);
          
          if (generated.length === 0) {
            setError("Could not find any agendas matching all hard constraints. Try relaxing budget or boundaries.");
            updateState({ status: PlanStatus.COLLECTING_PREFS });
            return;
          }

          // 2. AI Enhancement (Why it fits) - Simulate delay for UX
          const enhancedAgendas = await Promise.all(generated.map(async (agenda) => {
             // In a real app, we'd call Gemini here. For MVP speed, we use a simple string if API fails.
             const why = await generateWhyItFits(agenda, state.participants);
             return { ...agenda, whyItFits: why };
          }));

          updateState({ agendas: enhancedAgendas, status: PlanStatus.VOTING });
        } catch (e) {
          setError("Error generating agendas.");
          updateState({ status: PlanStatus.COLLECTING_PREFS });
        }
      };
      runEngine();
    }
  }, [state.status, state.participants, state.details, setError, updateState]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 text-indigo-600 font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => updateState(INITIAL_STATE)}
            title="Start Over"
          >
            <Sparkles size={24} />
            Night Out Planner
          </div>
          {state.status !== PlanStatus.DRAFT && (
            <div className="text-sm font-medium text-gray-500">
              Status: <Badge color="indigo">{state.status}</Badge>
            </div>
          )}
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 sm:pb-10 z-10">
        <nav aria-label="Progress" className="max-w-4xl mx-auto w-full mt-2">
          <ol role="list" className="flex items-center w-full">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isDisabled = index > currentStepIndex || state.status === PlanStatus.GENERATING;

              return (
                <li key={step.id} className={`relative ${index !== STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex items-center w-full">
                    <button
                      onClick={() => !isDisabled && updateState({ status: step.id })}
                      disabled={isDisabled}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 transition-all ${
                        isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:scale-110'
                      } ${
                        isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                        isCurrent ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50' :
                        'border-gray-300 text-gray-500 bg-white'
                      }`}
                      title={step.label}
                    >
                      {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                    </button>
                    {index !== STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-colors ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="absolute top-10 left-4 -translate-x-1/2 hidden sm:block w-24 text-center">
                    <span className={`text-xs font-medium ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-md">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold">Error</h3>
              <p>{state.error}</p>
            </div>
          </div>
        )}

        {state.status === PlanStatus.DRAFT && <ScreenCreatePlan state={state} updateState={updateState} setError={setError} />}
        {state.status === PlanStatus.COLLECTING_PREFS && <ScreenParticipants state={state} updateState={updateState} setError={setError} />}
        {state.status === PlanStatus.GENERATING && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Crunching the numbers...</h2>
            <p className="text-gray-500">Finding the perfect combinations for your group.</p>
          </div>
        )}
        {state.status === PlanStatus.VOTING && <ScreenVoting state={state} updateState={updateState} setError={setError} />}
        {state.status === PlanStatus.CONFIRMED && <ScreenConfirmed state={state} updateState={updateState} />}
        {state.status === PlanStatus.COORDINATING && <ScreenCoordination state={state} updateState={updateState} />}
        {state.status === PlanStatus.HOME_SAFE && <ScreenHomeSafe state={state} updateState={updateState} />}
      </main>
    </div>
  );
}
