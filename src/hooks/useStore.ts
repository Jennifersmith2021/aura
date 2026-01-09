"use client";

import { useState, useEffect, useCallback } from "react";
import { get, set, del } from "idb-keyval";
import { v4 as uuidv4 } from "uuid";
import { Item, Look, MeasurementLog, TimelineEntry, Routine, ShoppingItem, ShoppingList, Inspiration, ColorSeason, ChastitySession, CorsetSession, OrgasmLog, ArousalLog, ToyItem, IntimacyEntry, SkincareProduct, ClitMeasurement, WigItem, HairStyle, SissyTrainingGoal, SissyTrainingLog, ComplimentEntry, PackingList, SupplementLog, WorkoutPlan, WorkoutSession, DailyAffirmation, MakeupTutorial, Notification, NotificationSettings, Tag, Note, SearchHistory, SavedSearch, CalendarEvent, BreastGrowthEntry, ButtPlugSession } from "@/types";


export function useStore() {
    const [items, setItems] = useState<Item[]>([]);
    const [looks, setLooks] = useState<Look[]>([]);
    const [measurements, setMeasurements] = useState<MeasurementLog[]>([]);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [inspiration, setInspiration] = useState<Inspiration[]>([]);
    const [colorSeason, setColorSeason] = useState<ColorSeason | null>(null);

    const [chastitySessions, setChastitySessions] = useState<ChastitySession[]>([]);
    const [corsetSessions, setCorsetSessions] = useState<CorsetSession[]>([]);
    const [buttPlugSessions, setButtPlugSessions] = useState<ButtPlugSession[]>([]);
    const [orgasmLogs, setOrgasmLogs] = useState<OrgasmLog[]>([]);
    const [arousalLogs, setArousalLogs] = useState<ArousalLog[]>([]);
    const [toyCollection, setToyCollection] = useState<ToyItem[]>([]);
    const [intimacyJournal, setIntimacyJournal] = useState<IntimacyEntry[]>([]);
    const [skincareProducts, setSkincareProducts] = useState<SkincareProduct[]>([]);
    const [clitMeasurements, setClitMeasurements] = useState<ClitMeasurement[]>([]);
    const [breastGrowth, setBreastGrowth] = useState<BreastGrowthEntry[]>([]);
    const [wigCollection, setWigCollection] = useState<WigItem[]>([]);
    const [hairStyles, setHairStyles] = useState<HairStyle[]>([]);
    const [sissyGoals, setSissyGoals] = useState<SissyTrainingGoal[]>([]);
    const [sissyLogs, setSissyLogs] = useState<SissyTrainingLog[]>([]);
    const [compliments, setCompliments] = useState<ComplimentEntry[]>([]);
    const [packingLists, setPackingLists] = useState<PackingList[]>([]);
    
    // New features (December 2025)
    const [supplements, setSupplements] = useState<SupplementLog[]>([]);
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
    const [dailyAffirmations, setDailyAffirmations] = useState<DailyAffirmation[]>([]);
    const [makeupTutorials, setMakeupTutorials] = useState<MakeupTutorial[]>([]);
    
    // New features (January 2026) - Enhanced functionality
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        affirmations: true,
        affirmationTime: "08:00",
        workouts: true,
        supplements: true,
        challenges: true,
        achievements: true,
        email: false,
        push: true,
    });
    const [tags, setTags] = useState<Tag[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]); // IDs of favorited items
    
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                const [storedItems, storedLooks, storedMeasurements, storedTimeline, storedRoutines, storedShoppingItems, storedShoppingLists, storedInspiration, storedColorSeason, storedChastitySessions, storedCorsetSessions, storedButtPlugSessions, storedOrgasmLogs, storedArousalLogs, storedToyCollection, storedIntimacyJournal, storedSkincareProducts, storedClitMeasurements, storedBreastGrowth, storedWigCollection, storedHairStyles, storedSissyGoals, storedSissyLogs, storedCompliments, storedPackingLists, storedSupplements, storedWorkoutPlans, storedWorkoutSessions, storedDailyAffirmations, storedMakeupTutorials, storedNotifications, storedTags, storedNotes, storedSearchHistory, storedSavedSearches, storedCalendarEvents, storedFavorites] = await Promise.all([
                    get<Item[]>("items"),
                    get<Look[]>("looks"),
                    get<MeasurementLog[]>("measurements"),
                    get<TimelineEntry[]>("timeline"),
                    get<Routine[]>("routines"),
                    get<ShoppingItem[]>("shoppingItems"),
                    get<ShoppingList[]>("shoppingLists"),
                    get<Inspiration[]>("inspiration"),
                    get<ColorSeason | null>("colorSeason"),
                    get<ChastitySession[]>("chastitySessions"),
                    get<CorsetSession[]>("corsetSessions"),
                    get<ButtPlugSession[]>("buttPlugSessions"),
                    get<OrgasmLog[]>("orgasmLogs"),
                    get<ArousalLog[]>("arousalLogs"),
                    get<ToyItem[]>("toyCollection"),
                    get<IntimacyEntry[]>("intimacyJournal"),
                    get<SkincareProduct[]>("skincareProducts"),
                    get<ClitMeasurement[]>("clitMeasurements"),
                    get<BreastGrowthEntry[]>("breastGrowth"),
                    get<WigItem[]>("wigCollection"),
                    get<HairStyle[]>("hairStyles"),
                    get<SissyTrainingGoal[]>("sissyGoals"),
                    get<SissyTrainingLog[]>("sissyLogs"),
                    get<ComplimentEntry[]>("compliments"),
                    get<PackingList[]>("packingLists"),
                    get<SupplementLog[]>("supplements"),
                    get<WorkoutPlan[]>("workoutPlans"),
                    get<WorkoutSession[]>("workoutSessions"),
                    get<DailyAffirmation[]>("dailyAffirmations"),
                    get<MakeupTutorial[]>("makeupTutorials"),
                    get<Notification[]>("notifications"),
                    get<Tag[]>("tags"),
                    get<Note[]>("notes"),
                    get<SearchHistory[]>("searchHistory"),
                    get<SavedSearch[]>("savedSearches"),
                    get<CalendarEvent[]>("calendarEvents"),
                    get<string[]>("favorites"),
                ]);

                if (storedItems) setItems(storedItems);
                if (storedLooks) setLooks(storedLooks);
                if (storedMeasurements) setMeasurements(storedMeasurements);
                if (storedTimeline) setTimeline(storedTimeline);
                if (storedRoutines) setRoutines(storedRoutines);
                if (storedShoppingItems) setShoppingItems(storedShoppingItems);
                if (storedShoppingLists) setShoppingLists(storedShoppingLists);
                if (storedInspiration) setInspiration(storedInspiration);
                if (storedColorSeason) setColorSeason(storedColorSeason);
                if (storedChastitySessions) setChastitySessions(storedChastitySessions);
                if (storedCorsetSessions) setCorsetSessions(storedCorsetSessions);
                if (storedButtPlugSessions) setButtPlugSessions(storedButtPlugSessions);
                if (storedOrgasmLogs) setOrgasmLogs(storedOrgasmLogs);
                if (storedArousalLogs) setArousalLogs(storedArousalLogs);
                if (storedToyCollection) setToyCollection(storedToyCollection);
                if (storedIntimacyJournal) setIntimacyJournal(storedIntimacyJournal);
                if (storedSkincareProducts) setSkincareProducts(storedSkincareProducts);
                if (storedClitMeasurements) setClitMeasurements(storedClitMeasurements);
                if (storedBreastGrowth) setBreastGrowth(storedBreastGrowth);
                if (storedWigCollection) setWigCollection(storedWigCollection);
                if (storedHairStyles) setHairStyles(storedHairStyles);
                if (storedSissyGoals) {
                    setSissyGoals(storedSissyGoals);
                } else {
                    // Initialize with default preset goals
                    const defaultGoals: SissyTrainingGoal[] = [
                        {
                            id: 'default-1',
                            title: "Master Makeup Application",
                            category: "appearance",
                            description: "Learn to apply full makeup flawlessly",
                            completed: false,
                            priority: "high",
                            progress: 0,
                            milestones: ["Learn foundation basics", "Master eye makeup", "Perfect lip application", "Blend like a pro"],
                        },
                        {
                            id: 'default-2',
                            title: "Develop Feminine Voice",
                            category: "skills",
                            description: "Practice feminine voice and speech patterns",
                            completed: false,
                            priority: "high",
                            progress: 0,
                            milestones: ["Raise pitch", "Soften tone", "Practice inflection", "Build confidence"],
                        },
                        {
                            id: 'default-3',
                            title: "Build Complete Wardrobe",
                            category: "appearance",
                            description: "Acquire essential feminine clothing items",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Get first dress", "Buy lingerie sets", "Acquire heels", "Complete accessories"],
                        },
                        {
                            id: 'default-4',
                            title: "Perfect Feminine Walk",
                            category: "behavior",
                            description: "Learn to walk gracefully in heels",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Practice balance", "Hip sway", "Posture correction", "Confidence in public"],
                        },
                        {
                            id: 'default-5',
                            title: "Embrace Sissy Mindset",
                            category: "mindset",
                            description: "Accept and celebrate your sissy nature",
                            completed: false,
                            priority: "high",
                            progress: 0,
                            milestones: ["Daily affirmations", "Self-acceptance", "Confidence building", "Embrace femininity"],
                        },
                        {
                            id: 'default-6',
                            title: "Achieve Hourglass Figure",
                            category: "fitness",
                            description: "Develop feminine body shape through training",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Start waist training", "Hip exercises", "Weight management", "Track measurements"],
                        },
                        {
                            id: 'default-7',
                            title: "Serve with Devotion",
                            category: "intimate",
                            description: "Learn to serve and please properly",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Study techniques", "Practice positions", "Develop eagerness", "Perfect service"],
                        },
                        {
                            id: 'default-8',
                            title: "Master Chastity Discipline",
                            category: "intimate",
                            description: "Maintain long-term chastity with devotion",
                            completed: false,
                            priority: "high",
                            progress: 0,
                            milestones: ["Week locked", "Month locked", "Handle denial", "Find pleasure in chastity"],
                        },
                        {
                            id: 'default-9',
                            title: "Plug Training Progress",
                            category: "intimate",
                            description: "Progress through butt plug sizes comfortably",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Small plug comfort", "Wear for hours", "Medium size", "Large size mastery"],
                        },
                        {
                            id: 'default-10',
                            title: "Skincare Routine Excellence",
                            category: "appearance",
                            description: "Maintain flawless feminine skin",
                            completed: false,
                            priority: "low",
                            progress: 0,
                            milestones: ["Morning routine", "Evening routine", "Weekly treatments", "Perfect complexion"],
                        },
                        {
                            id: 'default-11',
                            title: "Graceful Mannerisms",
                            category: "behavior",
                            description: "Adopt feminine gestures and body language",
                            completed: false,
                            priority: "medium",
                            progress: 0,
                            milestones: ["Hand movements", "Sitting gracefully", "Eye contact", "Soft expressions"],
                        },
                        {
                            id: 'default-12',
                            title: "Hair & Wig Mastery",
                            category: "appearance",
                            description: "Style and maintain beautiful hair/wigs",
                            completed: false,
                            priority: "low",
                            progress: 0,
                            milestones: ["Choose right wig", "Styling techniques", "Natural look", "Confidence wearing"],
                        },
                    ];
                    setSissyGoals(defaultGoals);
                    set("sissyGoals", defaultGoals);
                }
                if (storedSissyLogs) setSissyLogs(storedSissyLogs);
                if (storedCompliments) setCompliments(storedCompliments);
                if (storedPackingLists) setPackingLists(storedPackingLists);
                if (storedSupplements) setSupplements(storedSupplements);
                if (storedWorkoutPlans) setWorkoutPlans(storedWorkoutPlans);
                if (storedWorkoutSessions) setWorkoutSessions(storedWorkoutSessions);
                if (storedDailyAffirmations) setDailyAffirmations(storedDailyAffirmations);
                if (storedMakeupTutorials) setMakeupTutorials(storedMakeupTutorials);
                if (storedNotifications) setNotifications(storedNotifications);
                if (storedTags) setTags(storedTags);
                if (storedNotes) setNotes(storedNotes);
                if (storedSearchHistory) setSearchHistory(storedSearchHistory);
                if (storedSavedSearches) setSavedSearches(storedSavedSearches);
                if (storedCalendarEvents) setCalendarEvents(storedCalendarEvents);
                if (storedFavorites) setFavorites(storedFavorites);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Items
    const addItem = useCallback(async (item: Item) => {
        const next = [...items, item];
        setItems(next);
        await set("items", next);
    }, [items]);

    const removeItem = useCallback(async (id: string) => {
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        await set("items", next);
    }, [items]);

    const updateItem = useCallback(async (updated: Item) => {
        const next = items.map((i) => (i.id === updated.id ? updated : i));
        setItems(next);
        await set("items", next);
    }, [items]);

    const hydrateItems = useCallback((next: Item[]) => {
        setItems(next);
        set("items", next);
    }, []);

    // Looks
    const addLook = useCallback(async (look: Look) => {
        setLooks((prev) => {
            const next = [...prev, look];
            set("looks", next);
            return next;
        });
    }, []);

    const removeLook = useCallback(async (id: string) => {
        setLooks((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("looks", next);
            return next;
        });
    }, []);

    // Measurements
    const addMeasurement = useCallback(async (log: MeasurementLog) => {
        setMeasurements((prev) => {
            const next = [...prev, log].sort((a, b) => b.date - a.date);
            set("measurements", next);
            return next;
        });
    }, []);

    // Timeline
    const addTimelineEntry = useCallback(async (entry: TimelineEntry) => {
        setTimeline((prev) => {
            const next = [...prev, entry].sort((a, b) => b.date - a.date);
            set("timeline", next);
            return next;
        });
    }, []);

    // Routines
    const addRoutine = useCallback(async (routine: Routine) => {
        setRoutines((prev) => {
            const next = [...prev, routine];
            set("routines", next);
            return next;
        });
    }, []);

    const removeRoutine = useCallback(async (id: string) => {
        setRoutines((prev) => {
            const next = prev.filter((r) => r.id !== id);
            set("routines", next);
            return next;
        });
    }, []);

    const updateRoutine = useCallback(async (updated: Routine) => {
        setRoutines((prev) => {
            const next = prev.map((r) => (r.id === updated.id ? updated : r));
            set("routines", next);
            return next;
        });
    }, []);

    // Shopping Items
    const addShoppingItem = useCallback(async (item: ShoppingItem) => {
        setShoppingItems((prev) => {
            const next = [...prev, item];
            set("shoppingItems", next);
            return next;
        });
    }, []);

    const removeShoppingItem = useCallback(async (id: string) => {
        setShoppingItems((prev) => {
            const next = prev.filter((i) => i.id !== id);
            set("shoppingItems", next);
            return next;
        });
    }, []);

    const updateShoppingItem = useCallback(async (updated: ShoppingItem) => {
        setShoppingItems((prev) => {
            const next = prev.map((i) => (i.id === updated.id ? updated : i));
            set("shoppingItems", next);
            return next;
        });
    }, []);

    const toggleWishlist = useCallback(async (id: string) => {
        setShoppingItems((prev) => {
            const next = prev.map((i) =>
                i.id === id ? { ...i, inWishlist: !i.inWishlist } : i
            );
            set("shoppingItems", next);
            return next;
        });
    }, []);

    // Shopping Lists
    const addShoppingList = useCallback(async (list: ShoppingList) => {
        setShoppingLists((prev) => {
            const next = [...prev, list];
            set("shoppingLists", next);
            return next;
        });
    }, []);

    const removeShoppingList = useCallback(async (id: string) => {
        setShoppingLists((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("shoppingLists", next);
            return next;
        });
    }, []);

    const updateShoppingList = useCallback(async (updated: ShoppingList) => {
        setShoppingLists((prev) => {
            const next = prev.map((l) => (l.id === updated.id ? updated : l));
            set("shoppingLists", next);
            return next;
        });
    }, []);

    // Inspiration
    const addInspiration = useCallback(async (entry: Inspiration) => {
        setInspiration((prev) => {
            const next = [...prev, entry];
            set("inspiration", next);
            return next;
        });
    }, []);

    const removeInspiration = useCallback(async (id: string) => {
        setInspiration((prev) => {
            const next = prev.filter((i) => i.id !== id);
            set("inspiration", next);
            return next;
        });
    }, []);

    // Color Season
    const setSeason = useCallback(async (season: ColorSeason | null) => {
        setColorSeason(season);
        set("colorSeason", season);
    }, []);

    // Chastity Tracker
    const lock = useCallback(async (session: ChastitySession) => {
        setChastitySessions((prev) => {
            const next = [...prev, session];
            set("chastitySessions", next);
            return next;
        });
    }, []);

    const unlock = useCallback(async (id: string, note?: string) => {
        setChastitySessions((prev) => {
            const next = prev.map(s =>
                s.id === id ? { ...s, endDate: Date.now(), note: note || s.note } : s
            );
            set("chastitySessions", next);
            return next;
        });
    }, []);

    const logHygiene = useCallback(async (sessionId: string) => {
        setChastitySessions((prev) => {
            const next = prev.map(s =>
                s.id === sessionId ? { ...s, hygieneChecks: [...(s.hygieneChecks || []), Date.now()] } : s
            );
            set("chastitySessions", next);
            return next;
        });
    }, []);

    // Corset Tracker
    const startCorsetSession = useCallback(async (session: CorsetSession) => {
        setCorsetSessions((prev) => {
            const next = [...prev, session];
            set("corsetSessions", next);
            return next;
        });
    }, []);

    const endCorsetSession = useCallback(async (id: string, waistAfter?: number, note?: string) => {
        setCorsetSessions((prev) => {
            const next = prev.map(s =>
                s.id === id ? { ...s, endDate: Date.now(), waistAfter, note: note || s.note } : s
            );
            set("corsetSessions", next);
            return next;
        });
    }, []);

    // Orgasm Tracker
    const addOrgasmLog = useCallback(async (log: OrgasmLog) => {
        setOrgasmLogs((prev) => {
            const next = [...prev, log].sort((a, b) => b.date - a.date);
            set("orgasmLogs", next);
            return next;
        });
    }, []);

    const removeOrgasmLog = useCallback(async (id: string) => {
        setOrgasmLogs((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("orgasmLogs", next);
            return next;
        });
    }, []);

    // Arousal Tracker
    const addArousalLog = useCallback(async (log: ArousalLog) => {
        setArousalLogs((prev) => {
            const next = [...prev, log].sort((a, b) => b.date - a.date);
            set("arousalLogs", next);
            return next;
        });
    }, []);

    const removeArousalLog = useCallback(async (id: string) => {
        setArousalLogs((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("arousalLogs", next);
            return next;
        });
    }, []);

    // Toy Collection
    const addToy = useCallback(async (toy: ToyItem) => {
        setToyCollection((prev) => {
            const next = [...prev, toy];
            set("toyCollection", next);
            return next;
        });
    }, []);

    const removeToy = useCallback(async (id: string) => {
        setToyCollection((prev) => {
            const next = prev.filter((t) => t.id !== id);
            set("toyCollection", next);
            return next;
        });
    }, []);

    const updateToy = useCallback(async (id: string, updates: Partial<ToyItem>) => {
        setToyCollection((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
            set("toyCollection", next);
            return next;
        });
    }, []);

    const logToyCleaning = useCallback(async (id: string) => {
        setToyCollection((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, lastCleaning: Date.now() } : t));
            set("toyCollection", next);
            return next;
        });
    }, []);

    // Intimacy Journal
    const addIntimacyEntry = useCallback(async (entry: IntimacyEntry) => {
        setIntimacyJournal((prev) => {
            const next = [...prev, entry].sort((a, b) => b.date - a.date);
            set("intimacyJournal", next);
            return next;
        });
    }, []);

    const removeIntimacyEntry = useCallback(async (id: string) => {
        setIntimacyJournal((prev) => {
            const next = prev.filter((e) => e.id !== id);
            set("intimacyJournal", next);
            return next;
        });
    }, []);

    const updateIntimacyEntry = useCallback(async (id: string, updates: Partial<IntimacyEntry>) => {
        setIntimacyJournal((prev) => {
            const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e)).sort((a, b) => b.date - a.date);
            set("intimacyJournal", next);
            return next;
        });
    }, []);

    // Skincare Products
    const addSkincareProduct = useCallback(async (product: SkincareProduct) => {
        setSkincareProducts((prev) => {
            const next = [...prev, product].sort((a, b) => a.order - b.order);
            set("skincareProducts", next);
            return next;
        });
    }, []);

    const removeSkincareProduct = useCallback(async (id: string) => {
        setSkincareProducts((prev) => {
            const next = prev.filter((p) => p.id !== id);
            set("skincareProducts", next);
            return next;
        });
    }, []);

    const updateSkincareProduct = useCallback(async (id: string, updates: Partial<SkincareProduct>) => {
        setSkincareProducts((prev) => {
            const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p)).sort((a, b) => a.order - b.order);
            set("skincareProducts", next);
            return next;
        });
    }, []);

    // Clit Measurements
    const addClitMeasurement = useCallback(async (measurement: ClitMeasurement) => {
        setClitMeasurements((prev) => {
            const next = [...prev, measurement].sort((a, b) => b.date - a.date);
            set("clitMeasurements", next);
            return next;
        });
    }, []);

    const removeClitMeasurement = useCallback(async (id: string) => {
        setClitMeasurements((prev) => {
            const next = prev.filter((m) => m.id !== id);
            set("clitMeasurements", next);
            return next;
        });
    }, []);

    // Breast Growth
    const addBreastGrowthEntry = useCallback((entry: Omit<BreastGrowthEntry, 'id'>) => {
        setBreastGrowth((prev) => {
            const next = [...prev, { ...entry, id: uuidv4() }].sort((a, b) => b.date - a.date);
            set("breastGrowth", next);
            return next;
        });
    }, []);

    const removeBreastGrowthEntry = useCallback((id: string) => {
        setBreastGrowth((prev) => {
            const next = prev.filter((e) => e.id !== id);
            set("breastGrowth", next);
            return next;
        });
    }, []);

    const updateBreastGrowthEntry = useCallback((id: string, updates: Partial<BreastGrowthEntry>) => {
        setBreastGrowth((prev) => {
            const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
            set("breastGrowth", next);
            return next;
        });
    }, []);

    // Wig Collection
    const addWig = useCallback(async (wig: WigItem) => {
        setWigCollection((prev) => {
            const next = [...prev, wig];
            set("wigCollection", next);
            return next;
        });
    }, []);

    const removeWig = useCallback(async (id: string) => {
        setWigCollection((prev) => {
            const next = prev.filter((w) => w.id !== id);
            set("wigCollection", next);
            return next;
        });
    }, []);

    const updateWig = useCallback(async (id: string, updates: Partial<WigItem>) => {
        setWigCollection((prev) => {
            const next = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
            set("wigCollection", next);
            return next;
        });
    }, []);

    // Hair Styles
    const addHairStyle = useCallback(async (style: HairStyle) => {
        setHairStyles((prev) => {
            const next = [...prev, style].sort((a, b) => b.date - a.date);
            set("hairStyles", next);
            return next;
        });
    }, []);

    const removeHairStyle = useCallback(async (id: string) => {
        setHairStyles((prev) => {
            const next = prev.filter((s) => s.id !== id);
            set("hairStyles", next);
            return next;
        });
    }, []);

    const updateHairStyle = useCallback(async (id: string, updates: Partial<HairStyle>) => {
        setHairStyles((prev) => {
            const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort((a, b) => b.date - a.date);
            set("hairStyles", next);
            return next;
        });
    }, []);

    // Sissy Training Goals
    const addSissyGoal = useCallback(async (goal: SissyTrainingGoal) => {
        setSissyGoals((prev) => {
            const next = [...prev, goal];
            set("sissyGoals", next);
            return next;
        });
    }, []);

    const removeSissyGoal = useCallback(async (id: string) => {
        setSissyGoals((prev) => {
            const next = prev.filter((g) => g.id !== id);
            set("sissyGoals", next);
            return next;
        });
    }, []);

    const updateSissyGoal = useCallback(async (id: string, updates: Partial<SissyTrainingGoal>) => {
        setSissyGoals((prev) => {
            const next = prev.map((g) => (g.id === id ? { ...g, ...updates } : g));
            set("sissyGoals", next);
            return next;
        });
    }, []);

    const toggleSissyGoalComplete = useCallback(async (id: string) => {
        setSissyGoals((prev) => {
            const goal = prev.find((g) => g.id === id);
            if (!goal) return prev;
            const next = prev.map((g) =>
                g.id === id
                    ? {
                          ...g,
                          completed: !g.completed,
                          completedDate: !g.completed ? Date.now() : undefined,
                          progress: !g.completed ? 100 : g.progress,
                      }
                    : g
            );
            set("sissyGoals", next);
            return next;
        });
    }, []);

    // Sissy Training Logs
    const addSissyLog = useCallback(async (log: SissyTrainingLog) => {
        setSissyLogs((prev) => {
            const next = [...prev, log].sort((a, b) => b.date - a.date);
            set("sissyLogs", next);
            return next;
        });
    }, []);

    const removeSissyLog = useCallback(async (id: string) => {
        setSissyLogs((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("sissyLogs", next);
            return next;
        });
    }, []);

    const updateSissyLog = useCallback(async (id: string, updates: Partial<SissyTrainingLog>) => {
        setSissyLogs((prev) => {
            const next = prev.map((l) => (l.id === id ? { ...l, ...updates } : l)).sort((a, b) => b.date - a.date);
            set("sissyLogs", next);
            return next;
        });
    }, []);

    // Compliment Journal
    const addCompliment = useCallback(async (compliment: ComplimentEntry) => {
        setCompliments((prev) => {
            const next = [...prev, compliment].sort((a, b) => b.date - a.date);
            set("compliments", next);
            return next;
        });
    }, []);

    const removeCompliment = useCallback(async (id: string) => {
        setCompliments((prev) => {
            const next = prev.filter((c) => c.id !== id);
            set("compliments", next);
            return next;
        });
    }, []);

    const updateCompliment = useCallback(async (id: string, updates: Partial<ComplimentEntry>) => {
        setCompliments((prev) => {
            const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c)).sort((a, b) => b.date - a.date);
            set("compliments", next);
            return next;
        });
    }, []);

    const toggleComplimentFavorite = useCallback(async (id: string) => {
        setCompliments((prev) => {
            const next = prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c));
            set("compliments", next);
            return next;
        });
    }, []);

    // Packing Lists
    const addPackingList = useCallback(async (list: PackingList) => {
        setPackingLists((prev) => {
            const next = [...prev, list].sort((a, b) => b.startDate - a.startDate);
            set("packingLists", next);
            return next;
        });
    }, []);

    const removePackingList = useCallback(async (id: string) => {
        setPackingLists((prev) => {
            const next = prev.filter((l) => l.id !== id);
            set("packingLists", next);
            return next;
        });
    }, []);

    const updatePackingList = useCallback(async (id: string, updates: Partial<PackingList>) => {
        setPackingLists((prev) => {
            const next = prev.map((l) => (l.id === id ? { ...l, ...updates } : l)).sort((a, b) => b.startDate - a.startDate);
            set("packingLists", next);
            return next;
        });
    }, []);

    // Supplements (NEW)
    const addSupplement = useCallback(async (supplement: Omit<SupplementLog, 'id'>) => {
        setSupplements((prev) => {
            const next = [
                ...prev,
                { ...supplement, id: uuidv4() }
            ].sort((a, b) => b.date - a.date);
            set("supplements", next);
            return next;
        });
    }, []);

    const removeSupplement = useCallback(async (id: string) => {
        setSupplements((prev) => {
            const next = prev.filter((s) => s.id !== id);
            set("supplements", next);
            return next;
        });
    }, []);

    const updateSupplement = useCallback(async (id: string, updates: Partial<SupplementLog>) => {
        setSupplements((prev) => {
            const next = prev.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            );
            set("supplements", next);
            return next;
        });
    }, []);

    // Workout Plans & Sessions (NEW)
    const addWorkoutPlan = useCallback(async (plan: Omit<WorkoutPlan, 'id'>) => {
        setWorkoutPlans((prev) => {
            const next = [
                ...prev,
                { ...plan, id: uuidv4() }
            ].sort((a, b) => b.date - a.date);
            set("workoutPlans", next);
            return next;
        });
    }, []);

    const removeWorkoutPlan = useCallback(async (id: string) => {
        setWorkoutPlans((prev) => {
            const next = prev.filter((p) => p.id !== id);
            set("workoutPlans", next);
            return next;
        });
    }, []);

    const updateWorkoutPlan = useCallback(async (id: string, updates: Partial<WorkoutPlan>) => {
        setWorkoutPlans((prev) => {
            const next = prev.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            );
            set("workoutPlans", next);
            return next;
        });
    }, []);

    const addWorkoutSession = useCallback(async (session: Omit<WorkoutSession, 'id'>) => {
        setWorkoutSessions((prev) => {
            const next = [
                ...prev,
                { ...session, id: uuidv4() }
            ].sort((a, b) => b.date - a.date);
            set("workoutSessions", next);
            return next;
        });
    }, []);

    const removeWorkoutSession = useCallback(async (id: string) => {
        setWorkoutSessions((prev) => {
            const next = prev.filter((s) => s.id !== id);
            set("workoutSessions", next);
            return next;
        });
    }, []);

    const updateWorkoutSession = useCallback(async (id: string, updates: Partial<WorkoutSession>) => {
        setWorkoutSessions((prev) => {
            const next = prev.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            );
            set("workoutSessions", next);
            return next;
        });
    }, []);

    // Daily Affirmations (NEW)
    const addDailyAffirmation = useCallback(async (affirmation: Omit<DailyAffirmation, 'id'>) => {
        setDailyAffirmations((prev) => {
            const next = [
                ...prev,
                { ...affirmation, id: uuidv4() }
            ].sort((a, b) => b.dateAdded - a.dateAdded);
            set("dailyAffirmations", next);
            return next;
        });
    }, []);

    const removeDailyAffirmation = useCallback(async (id: string) => {
        setDailyAffirmations((prev) => {
            const next = prev.filter((a) => a.id !== id);
            set("dailyAffirmations", next);
            return next;
        });
    }, []);

    const updateDailyAffirmation = useCallback(async (id: string, updates: Partial<DailyAffirmation>) => {
        setDailyAffirmations((prev) => {
            const next = prev.map((a) =>
                a.id === id ? { ...a, ...updates } : a
            );
            set("dailyAffirmations", next);
            return next;
        });
    }, []);

    const toggleAffirmationFavorite = useCallback(async (id: string) => {
        setDailyAffirmations((prev) => {
            const next = prev.map((a) =>
                a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
            );
            set("dailyAffirmations", next);
            return next;
        });
    }, []);

    // Makeup Tutorials
    const addMakeupTutorial = useCallback(async (tutorial: MakeupTutorial) => {
        setMakeupTutorials((prev) => {
            const next = [tutorial, ...prev];
            set("makeupTutorials", next);
            return next;
        });
    }, []);

    const updateMakeupTutorial = useCallback(async (id: string, updates: Partial<MakeupTutorial>) => {
        setMakeupTutorials((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
            set("makeupTutorials", next);
            return next;
        });
    }, []);

    const logMakeupPractice = useCallback(async (id: string) => {
        setMakeupTutorials((prev) => {
            const next = prev.map((t) =>
                t.id === id
                    ? {
                        ...t,
                        practiceCount: (t.practiceCount || 0) + 1,
                        lastPracticed: Date.now(),
                        status: t.status === "planned" ? "in-progress" : t.status,
                    }
                    : t
            );
            set("makeupTutorials", next);
            return next;
        });
    }, []);

    const removeMakeupTutorial = useCallback(async (id: string) => {
        setMakeupTutorials((prev) => {
            const next = prev.filter((t) => t.id !== id);
            set("makeupTutorials", next);
            return next;
        });
    }, []);

    // New Feature Mutations (January 2026)

    // Notifications
    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        setNotifications((prev) => {
            const next = [...prev, { ...notification, id: uuidv4() }].sort((a, b) => b.dateCreated - a.dateCreated);
            set("notifications", next);
            return next;
        });
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => {
            const next = prev.filter((n) => n.id !== id);
            set("notifications", next);
            return next;
        });
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications((prev) => {
            const next = prev.map((n) => n.id === id ? { ...n, read: true } : n);
            set("notifications", next);
            return next;
        });
    }, []);

    const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
        setNotificationSettings((prev) => {
            const next = { ...prev, ...settings };
            set("notificationSettings", next);
            return next;
        });
    }, []);

    // Tags
    const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
        setTags((prev) => {
            const next = [...prev, { ...tag, id: uuidv4() }];
            set("tags", next);
            return next;
        });
    }, []);

    const removeTag = useCallback((id: string) => {
        setTags((prev) => {
            const next = prev.filter((t) => t.id !== id);
            set("tags", next);
            return next;
        });
    }, []);

    const updateTag = useCallback((id: string, updates: Partial<Tag>) => {
        setTags((prev) => {
            const next = prev.map((t) => t.id === id ? { ...t, ...updates } : t);
            set("tags", next);
            return next;
        });
    }, []);

    // Notes
    const addNote = useCallback((note: Omit<Note, 'id'>) => {
        setNotes((prev) => {
            const next = [...prev, { ...note, id: uuidv4() }];
            set("notes", next);
            return next;
        });
    }, []);

    const removeNote = useCallback((id: string) => {
        setNotes((prev) => {
            const next = prev.filter((n) => n.id !== id);
            set("notes", next);
            return next;
        });
    }, []);

    const updateNote = useCallback((id: string, updates: Partial<Note>) => {
        setNotes((prev) => {
            const next = prev.map((n) => n.id === id ? { ...n, ...updates, dateModified: Date.now() } : n);
            set("notes", next);
            return next;
        });
    }, []);

    // Search History
    const addSearchHistory = useCallback((search: Omit<SearchHistory, 'id'>) => {
        setSearchHistory((prev) => {
            const next = [...prev, { ...search, id: uuidv4() }].slice(-50); // Keep last 50
            set("searchHistory", next);
            return next;
        });
    }, []);

    const clearSearchHistory = useCallback(() => {
        setSearchHistory([]);
        set("searchHistory", []);
    }, []);

    // Saved Searches
    const addSavedSearch = useCallback((search: Omit<SavedSearch, 'id'>) => {
        setSavedSearches((prev) => {
            const next = [...prev, { ...search, id: uuidv4() }];
            set("savedSearches", next);
            return next;
        });
    }, []);

    const removeSavedSearch = useCallback((id: string) => {
        setSavedSearches((prev) => {
            const next = prev.filter((s) => s.id !== id);
            set("savedSearches", next);
            return next;
        });
    }, []);

    // Calendar Events
    const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
        setCalendarEvents((prev) => {
            const next = [...prev, { ...event, id: uuidv4() }];
            set("calendarEvents", next);
            return next;
        });
    }, []);

    const removeCalendarEvent = useCallback((id: string) => {
        setCalendarEvents((prev) => {
            const next = prev.filter((e) => e.id !== id);
            set("calendarEvents", next);
            return next;
        });
    }, []);

    const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
        setCalendarEvents((prev) => {
            const next = prev.map((e) => e.id === id ? { ...e, ...updates } : e);
            set("calendarEvents", next);
            return next;
        });
    }, []);

    // Butt Plug Training & Tracking
    const addButtPlugSession = useCallback(async (session: Omit<ButtPlugSession, 'id'>) => {
        setButtPlugSessions((prev) => {
            const newSession: ButtPlugSession = {
                ...session,
                id: uuidv4(),
            };
            const next = [...prev, newSession].sort((a, b) => b.startDate - a.startDate);
            set("buttPlugSessions", next);
            return next;
        });
    }, []);

    const removeButtPlugSession = useCallback((id: string) => {
        setButtPlugSessions((prev) => {
            const next = prev.filter((s) => s.id !== id);
            set("buttPlugSessions", next);
            return next;
        });
    }, []);

    const updateButtPlugSession = useCallback((id: string, updates: Partial<ButtPlugSession>) => {
        setButtPlugSessions((prev) => {
            const next = prev.map((s) => s.id === id ? { ...s, ...updates } : s);
            set("buttPlugSessions", next);
            return next;
        });
    }, []);

    // Favorites
    const toggleFavorite = useCallback((id: string) => {
        setFavorites((prev) => {
            const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
            set("favorites", next);
            return next;
        });
    }, []);

    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

    return {
        loading,
        items,
        hydrateItems,
        looks,
        measurements,
        timeline,
        routines,
        shoppingItems,
        shoppingLists,
        inspiration,
        colorSeason,
        chastitySessions,
        corsetSessions,
        buttPlugSessions,
        orgasmLogs,
        arousalLogs,
        toyCollection,
        intimacyJournal,
        skincareProducts,
        clitMeasurements,
        breastGrowth,
        wigCollection,
        hairStyles,
        makeupTutorials,
        addItem,
        removeItem,
        updateItem,
        addLook,
        removeLook,
        addMeasurement,
        addTimelineEntry,
        addRoutine,
        removeRoutine,
        updateRoutine,
        addShoppingItem,
        removeShoppingItem,
        updateShoppingItem,
        toggleWishlist,
        addShoppingList,
        removeShoppingList,
        updateShoppingList,
        addInspiration,
        removeInspiration,
        setSeason,
        lock,
        unlock,
        logHygiene,
        startCorsetSession,
        endCorsetSession,
        addButtPlugSession,
        removeButtPlugSession,
        updateButtPlugSession,
        addOrgasmLog,
        removeOrgasmLog,
        addArousalLog,
        removeArousalLog,
        addToy,
        removeToy,
        updateToy,
        logToyCleaning,
        addIntimacyEntry,
        removeIntimacyEntry,
        updateIntimacyEntry,
        addSkincareProduct,
        removeSkincareProduct,
        updateSkincareProduct,
        addClitMeasurement,
        removeClitMeasurement,
        addBreastGrowthEntry,
        removeBreastGrowthEntry,
        updateBreastGrowthEntry,
        addWig,
        removeWig,
        updateWig,
        addHairStyle,
        removeHairStyle,
        updateHairStyle,
        sissyGoals,
        addSissyGoal,
        removeSissyGoal,
        updateSissyGoal,
        toggleSissyGoalComplete,
        sissyLogs,
        addSissyLog,
        removeSissyLog,
        updateSissyLog,
        compliments,
        addCompliment,
        removeCompliment,
        updateCompliment,
        toggleComplimentFavorite,
        packingLists,
        addPackingList,
        removePackingList,
        updatePackingList,
        supplements,
        addSupplement,
        removeSupplement,
        updateSupplement,
        workoutPlans,
        addWorkoutPlan,
        removeWorkoutPlan,
        updateWorkoutPlan,
        workoutSessions,
        addWorkoutSession,
        removeWorkoutSession,
        updateWorkoutSession,
        dailyAffirmations,
        addDailyAffirmation,
        removeDailyAffirmation,
        updateDailyAffirmation,
        toggleAffirmationFavorite,
        addMakeupTutorial,
        updateMakeupTutorial,
        removeMakeupTutorial,
        logMakeupPractice,
        // New features (January 2026)
        notifications,
        addNotification,
        removeNotification,
        markNotificationAsRead,
        notificationSettings,
        updateNotificationSettings,
        tags,
        addTag,
        removeTag,
        updateTag,
        notes,
        addNote,
        removeNote,
        updateNote,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        savedSearches,
        addSavedSearch,
        removeSavedSearch,
        calendarEvents,
        addCalendarEvent,
        removeCalendarEvent,
        updateCalendarEvent,
        favorites,
        toggleFavorite,
        isFavorite,
    };
}
